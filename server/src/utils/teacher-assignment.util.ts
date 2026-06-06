import { In } from 'typeorm';
import { DataSource } from 'typeorm';
import { TeacherAssignmentRule } from 'src/db/entities/TeacherAssignmentRule.entity';
import { Event } from 'src/db/entities/Event.entity';
import { StudentClass } from 'src/db/entities/StudentClass.entity';
import { Student } from 'src/db/entities/Student.entity';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { groupDataByKeyFn, groupDataByKeyFnAndCalc } from '@shared/utils/reportData.util';

/**
 * Picks the teacher with the lowest family-level load from a pool of teacher IDs.
 * Shuffles first so ties resolve randomly (not by array order).
 */
function pickTeacherByLoad(teacherIds: number[], familyLoadCount: Map<number, number>): number {
  const shuffled = [...teacherIds].sort(() => Math.random() - 0.5);
  return shuffled.reduce((best, id) =>
    (familyLoadCount.get(id) ?? 0) < (familyLoadCount.get(best) ?? 0) ? id : best,
  );
}

function processRule(
  rule: TeacherAssignmentRule,
  eventsByFamily: Record<string, Event[]>,
  gradesByFamily: Record<string, Set<string>>,
  assignedFamilies: Set<string>,
  familyLoadCount: Map<number, number>,
  result: Map<number, number | null>,
) {
  const grade = rule.gradeLevelKey?.trim();
  const teacherIds = rule.teacherReferenceIds ?? [];
  if (!grade || !teacherIds.length) return;

  for (const [familyId, familyEvents] of Object.entries(eventsByFamily)) {
    if (assignedFamilies.has(familyId)) continue;

    // Does this family have any student in this rule's grade?
    if (!gradesByFamily[familyId]?.has(grade)) continue;

    const chosenTeacherId = pickTeacherByLoad(teacherIds, familyLoadCount);
    familyLoadCount.set(chosenTeacherId, (familyLoadCount.get(chosenTeacherId) ?? 0) + 1);
    assignedFamilies.add(familyId);

    for (const ev of familyEvents) result.set(ev.id, chosenTeacherId);
  }
}

/**
 * Assigns teachers to a batch of selected events using the sequential grade-by-grade rules engine.
 *
 * Algorithm (grade-by-grade with sister propagation):
 *  For each rule (ordered by `order` ASC):
 *    1. Find all unassigned families that have at least one student enrolled in rule.gradeLevelKey.
 *    2. Assign the entire family (all selected events for that family) to the lowest-loaded teacher
 *       among rule.teacherReferenceIds.
 *    3. Increment that teacher's family load count.
 *    4. Move to the next rule — already-assigned families are skipped automatically.
 *
 * @param eventIds   IDs of the selected events to assign. Existing assignments are overwritten.
 * @param dataSource TypeORM DataSource for DB queries.
 * @param userId     Current user ID (scoping).
 * @returns Map of eventId → chosen teacherReferenceId (null if no rule matched).
 */
export async function assignTeachersByRules(
  eventIds: number[],
  dataSource: DataSource,
  userId: number,
): Promise<Map<number, number | null>> {
  if (!eventIds.length) return new Map();

  const eventRepo = dataSource.getRepository(Event);

  // 1. Load selected events with their student relation
  const events = await eventRepo.find({
    where: { id: In(eventIds), userId },
    relations: ['student', 'studentClass'],
  });

  const year = events[0]?.year ?? getCurrentHebrewYear();

  // 2. Group events by familyReferenceId and pre-calculate which families have students in which grade levels
  const eventsByFamily = groupDataByKeyFn(events, (e) => e.student?.familyReferenceId ?? null);
  const gradesByFamily = groupDataByKeyFnAndCalc(events, (e) => e.student?.familyReferenceId ?? null, evs => new Set(evs.map(ev => ev.studentClass?.gradeLevel)));
  const result = new Map<number, number | null>();
  const familyLoadCount = new Map<number, number>();

  // 3. Load active rules ordered by execution sequence (ignoring any rules without gradeLevelKey)
  const rules = await dataSource.getRepository(TeacherAssignmentRule).find({
    where: { userId, year, isActive: true },
    order: { order: 'ASC' },
  });

  // 4. Track which families have been assigned
  const assignedFamilies = new Set<string>();

  for (const rule of rules) {
    processRule(rule, eventsByFamily, gradesByFamily, assignedFamilies, familyLoadCount, result);
  }

  return result;
}

/**
 * For the yemot auto-assign path: given a single newly created event,
 * determine the teacher using the rules engine.
 *
 * Multi-Stage Resolution:
 *  1. Query active same-family events of the SAME type with event dates within +/- 30 days.
 *     If an event with an assigned teacher is found, reuse that teacher.
 *  2. If none, determine the matching rule on the student's class grade level.
 *  3. Once the matching rule is found:
 *     - If the rule specifies exactly one teacher, assign her.
 *     - If the rule specifies multiple teachers, compare the worksheets of those teachers
 *       within the +/- 30 days window and assign the teacher carrying the lowest workload.
 *
 * @returns chosen teacherReferenceId or null.
 */
export async function autoAssignTeacherForEvent(
  event: Event,
  student: Student,
  dataSource: DataSource,
): Promise<number | null> {
  const familyId = event.student?.familyReferenceId ?? null;
  if (!familyId) return null;

  const userId = event.userId;
  const year = event.year ?? getCurrentHebrewYear();

  // Convert eventDate to date range (relative math +/- 30 days)
  const pivotDate = event.eventDate ? new Date(event.eventDate) : new Date();
  const start = new Date(pivotDate);
  const end = new Date(pivotDate);
  start.setDate(pivotDate.getDate() - 30);
  end.setDate(pivotDate.getDate() + 30);

  // 1. Same-family, same-type, +/- 30 days window search
  const existingSameTypeEvent = await dataSource
    .getRepository(Event)
    .createQueryBuilder('e')
    .innerJoin('e.student', 's')
    .select('e.teacherReferenceId', 'teacherReferenceId')
    .where('e.userId = :userId', { userId })
    .andWhere('s.familyReferenceId = :familyId', { familyId })
    .andWhere('e.eventTypeReferenceId = :eventTypeId', { eventTypeId: event.eventTypeReferenceId })
    .andWhere('e.teacherReferenceId IS NOT NULL')
    .andWhere('e.eventDate BETWEEN :start AND :end', { start, end })
    .limit(1)
    .getRawOne<{ teacherReferenceId: number }>();

  if (existingSameTypeEvent?.teacherReferenceId) {
    return existingSameTypeEvent.teacherReferenceId;
  }

  // Find student's grade level for this event/year
  let studentClass: StudentClass | null = null;
  if (event.studentClassReferenceId) {
    studentClass = await dataSource.getRepository(StudentClass).findOne({
      where: { id: event.studentClassReferenceId },
      relations: ['class'],
    });
  }

  if (!studentClass) {
    studentClass = await dataSource.getRepository(StudentClass).findOne({
      where: { studentReferenceId: student.id, year, userId },
      relations: ['class'],
    });
  }

  const gradeLevel = studentClass?.class?.gradeLevel;
  if (!gradeLevel) {
    return null;
  }

  // 2. Load active rules ordered by priority sequence and find first matching rule for student's grade level
  const rules = await dataSource.getRepository(TeacherAssignmentRule).find({
    where: { userId, year, isActive: true },
    order: { order: 'ASC' },
  });

  const matchedRule = rules.find((r) => r.gradeLevelKey?.trim() === gradeLevel.trim());

  if (!matchedRule || !matchedRule.teacherReferenceIds?.length) {
    return null;
  }

  const teacherIds = matchedRule.teacherReferenceIds;

  // 3. If there is only one teacher in the rule, assign her directly
  if (teacherIds.length === 1) {
    return teacherIds[0];
  }

  // 4. If there are multiple teachers under the rule, query worksheets of candidate teachers in the 60-day window
  const loadRows = await dataSource
    .getRepository(Event)
    .createQueryBuilder('e')
    .select('e.teacherReferenceId', 'teacherReferenceId')
    .addSelect('COUNT(*)', 'count')
    .where('e.userId = :userId', { userId })
    .andWhere('e.teacherReferenceId IN (:...teacherIds)', { teacherIds })
    .andWhere('e.eventDate BETWEEN :start AND :end', { start, end })
    .groupBy('e.teacherReferenceId')
    .getRawMany<{ teacherReferenceId: number; count: string }>();

  const loadMap = new Map<number, number>();
  for (const row of loadRows) {
    loadMap.set(Number(row.teacherReferenceId), Number(row.count));
  }

  // Choose the candidate teacher with the lowest workload within the +/- 30 days window
  const shuffled = [...teacherIds].sort(() => Math.random() - 0.5);
  return shuffled.reduce((best, id) =>
    (loadMap.get(id) ?? 0) < (loadMap.get(best) ?? 0) ? id : best,
  );
}
