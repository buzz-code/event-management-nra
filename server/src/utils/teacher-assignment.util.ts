import { In } from 'typeorm';
import { DataSource } from 'typeorm';
import { TeacherAssignmentRule } from 'src/db/entities/TeacherAssignmentRule.entity';
import { Event } from 'src/db/entities/Event.entity';
import { StudentClass } from 'src/db/entities/StudentClass.entity';
import { Class } from 'src/db/entities/Class.entity';
import { Student } from 'src/db/entities/Student.entity';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { groupDataByKeyFnAndCalc } from '@shared/utils/reportData.util';

// ─── Shared types ─────────────────────────────────────────────────────────────

/** Per-family data derived from a batch of events. */
interface FamilyData {
  events: Event[];
  grades: Set<string>;
}

/** Mutable accumulator threaded through each rule during bulk assignment. */
interface BulkAssignmentState {
  families: Record<string, FamilyData>;
  familyLoadCount: Map<number, number>;
  result: Map<number, number | null>;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

/**
 * Returns the teacher from `teacherIds` with the lowest current load.
 * Shuffles before comparing so ties are broken randomly rather than by array order.
 */
function pickLeastLoadedTeacher(teacherIds: number[], loadCount: Map<number, number>): number {
  const shuffled = [...teacherIds].sort(() => Math.random() - 0.5);
  return shuffled.reduce((best, id) =>
    (loadCount.get(id) ?? 0) < (loadCount.get(best) ?? 0) ? id : best,
  );
}

/** Returns a ±`days`-day window around `pivot`. */
function getDateRange(pivot: Date, days: number): { start: Date; end: Date } {
  const start = new Date(pivot);
  const end = new Date(pivot);
  start.setDate(pivot.getDate() - days);
  end.setDate(pivot.getDate() + days);
  return { start, end };
}

// ─── Bulk-assignment helpers ──────────────────────────────────────────────────

async function loadEventsWithRelations(
  eventIds: number[],
  userId: number,
  dataSource: DataSource,
): Promise<Event[]> {
  return dataSource.getRepository(Event).find({
    where: { id: In(eventIds), userId },
    relations: ['student', 'studentClass'],
  });
}

/**
 * Groups events by familyReferenceId into a Record of FamilyData.
 * Each entry holds the family's events and the set of grade levels across them.
 * Events without a familyReferenceId are excluded.
 */
function buildFamilyMap(events: Event[]): Record<string, FamilyData> {
  return groupDataByKeyFnAndCalc(
    events,
    (e) => e.student?.familyReferenceId,
    (evs) => ({
      events: evs,
      grades: new Set(evs.map((ev) => ev.studentClass?.gradeLevel).filter(Boolean)),
    }),
  );
}

async function loadActiveRules(
  userId: number,
  year: number,
  dataSource: DataSource,
): Promise<TeacherAssignmentRule[]> {
  return dataSource.getRepository(TeacherAssignmentRule).find({
    where: { userId, year, isActive: true },
    order: { order: 'ASC' },
  });
}

/**
 * Applies one rule to the current state:
 * finds all unassigned families that contain a student in the rule's grade,
 * assigns every event of the matching family to the least-loaded eligible teacher.
 * A family is considered already assigned if its first event is already in result.
 */
function applyRule(rule: TeacherAssignmentRule, state: BulkAssignmentState): void {
  const grade = rule.gradeLevelKey?.trim();
  const teacherIds = rule.teacherReferenceIds ?? [];
  if (!grade || !teacherIds.length) return;

  for (const family of Object.values(state.families)) {
    if (state.result.has(family.events[0].id)) continue;
    if (!family.grades.has(grade)) continue;

    const chosenTeacherId = pickLeastLoadedTeacher(teacherIds, state.familyLoadCount);
    state.familyLoadCount.set(chosenTeacherId, (state.familyLoadCount.get(chosenTeacherId) ?? 0) + 1);

    for (const ev of family.events) state.result.set(ev.id, chosenTeacherId);
  }
}

// ─── Auto-assign helpers ──────────────────────────────────────────────────────

/**
 * Stage 1: looks for a same-family, same-event-type event that already has a
 * teacher assigned within the ±30-day window.  If found, reuse that teacher.
 */
async function findExistingFamilyAssignment(
  event: Event,
  familyId: string,
  dateRange: { start: Date; end: Date },
  dataSource: DataSource,
): Promise<number | null> {
  const row = await dataSource
    .getRepository(Event)
    .createQueryBuilder('e')
    .innerJoin('e.student', 's')
    .select('e.teacherReferenceId', 'teacherReferenceId')
    .where('e.userId = :userId', { userId: event.userId })
    .andWhere('s.familyReferenceId = :familyId', { familyId })
    .andWhere('e.eventTypeReferenceId = :eventTypeId', { eventTypeId: event.eventTypeReferenceId })
    .andWhere('e.teacherReferenceId IS NOT NULL')
    .andWhere('e.eventDate BETWEEN :start AND :end', dateRange)
    .limit(1)
    .getRawOne<{ teacherReferenceId: number }>();

  return row?.teacherReferenceId ?? null;
}

/**
 * Stage 2: resolves the student's grade level for this event/year.
 *
 * event.studentClassReferenceId is a Class FK (set by Event.fillFields from
 * studentClass.classReferenceId), so we query the Class repo directly when
 * available.  Falls back to a StudentClass lookup by student + year.
 */
async function findStudentGradeLevel(
  event: Event,
  student: Student,
  year: number,
  dataSource: DataSource,
): Promise<string | null> {
  if (event.studentClassReferenceId) {
    const cls = await dataSource
      .getRepository(Class)
      .findOne({ where: { id: event.studentClassReferenceId } });
    if (cls?.gradeLevel) return cls.gradeLevel;
  }

  const sc = await dataSource.getRepository(StudentClass).findOne({
    where: { studentReferenceId: student.id, year, userId: event.userId },
    relations: ['class'],
  });
  return sc?.class?.gradeLevel ?? null;
}

/**
 * Stage 4: queries how many events each candidate teacher has within the window,
 * returning a load map used to pick the least-loaded one.
 */
async function queryTeacherWorkload(
  teacherIds: number[],
  dateRange: { start: Date; end: Date },
  userId: number,
  dataSource: DataSource,
): Promise<Map<number, number>> {
  const rows = await dataSource
    .getRepository(Event)
    .createQueryBuilder('e')
    .select('e.teacherReferenceId', 'teacherReferenceId')
    .addSelect('COUNT(*)', 'count')
    .where('e.userId = :userId', { userId })
    .andWhere('e.teacherReferenceId IN (:...teacherIds)', { teacherIds })
    .andWhere('e.eventDate BETWEEN :start AND :end', dateRange)
    .groupBy('e.teacherReferenceId')
    .getRawMany<{ teacherReferenceId: number; count: string }>();

  return new Map(rows.map((r) => [Number(r.teacherReferenceId), Number(r.count)]));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Assigns teachers to a batch of selected events using the sequential
 * grade-by-grade rules engine.
 *
 * Algorithm (grade-by-grade with family propagation):
 *  For each rule (ordered by `order` ASC):
 *    1. Find unassigned families with at least one student in rule.gradeLevelKey.
 *    2. Assign ALL events of the matching family to the least-loaded teacher
 *       from rule.teacherReferenceIds.
 *    3. Mark the family as done; skip it in subsequent rules.
 *
 * @returns Map of eventId → chosen teacherReferenceId (null if no rule matched).
 */
export async function assignTeachersByRules(
  eventIds: number[],
  dataSource: DataSource,
  userId: number,
): Promise<Map<number, number | null>> {
  if (!eventIds.length) return new Map();

  const events = await loadEventsWithRelations(eventIds, userId, dataSource);
  const year = events[0]?.year ?? getCurrentHebrewYear();
  const rules = await loadActiveRules(userId, year, dataSource);

  const state: BulkAssignmentState = {
    families: buildFamilyMap(events),
    familyLoadCount: new Map(),
    result: new Map(),
  };

  for (const rule of rules) {
    applyRule(rule, state);
  }

  return state.result;
}

/**
 * For the yemot auto-assign path: given a single newly created event,
 * determine the teacher using a four-stage resolution:
 *
 *  1. Reuse an existing teacher from a same-family, same-type event (±30 days).
 *  2. Resolve the student's grade level from their class enrolment.
 *  3. Find the first active rule whose gradeLevelKey matches that grade.
 *  4. If the rule has multiple teachers, pick the one with the lowest workload
 *     in the ±30-day window.
 *
 * @returns chosen teacherReferenceId, or null if no assignment could be made.
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
  const dateRange = getDateRange(event.eventDate ? new Date(event.eventDate) : new Date(), 30);

  // Stage 1 — reuse existing family assignment within the window
  const existingTeacherId = await findExistingFamilyAssignment(event, familyId, dateRange, dataSource);
  if (existingTeacherId) return existingTeacherId;

  // Stage 2 — resolve grade level
  const gradeLevel = await findStudentGradeLevel(event, student, year, dataSource);
  if (!gradeLevel) return null;

  // Stage 3 — find matching rule
  const rules = await loadActiveRules(userId, year, dataSource);
  const matchedRule = rules.find((r) => r.gradeLevelKey?.trim() === gradeLevel.trim());
  if (!matchedRule?.teacherReferenceIds?.length) return null;

  const { teacherReferenceIds } = matchedRule;

  // Stage 4 — pick least-loaded teacher (single teacher: short-circuit)
  if (teacherReferenceIds.length === 1) return teacherReferenceIds[0];

  const workload = await queryTeacherWorkload(teacherReferenceIds, dateRange, userId, dataSource);
  return pickLeastLoadedTeacher(teacherReferenceIds, workload);
}
