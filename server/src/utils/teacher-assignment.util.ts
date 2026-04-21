import { Event } from 'src/db/entities/Event.entity';
import { TeacherAssignmentRule } from 'src/db/entities/TeacherAssignmentRule.entity';
import { FamilyTeacherAssignment } from 'src/db/entities/FamilyTeacherAssignment.entity';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getWeightedLoad(rule: TeacherAssignmentRule, loadCount: Map<number, number>): number {
  return (loadCount.get(rule.teacherReferenceId) ?? 0) / (rule.customRatio ?? 1);
}

/**
 * Picks the lowest weighted-load teacher from a pool of rules.
 * Shuffles first so ties resolve randomly (not by DB order).
 */
function pickBestRule(
  rulesPool: TeacherAssignmentRule[],
  loadCount: Map<number, number>,
): TeacherAssignmentRule {
  const pool = shuffled(rulesPool);
  return pool.reduce((best, rule) =>
    getWeightedLoad(rule, loadCount) < getWeightedLoad(best, loadCount) ? rule : best,
  );
}

/**
 * Picks the teacher for a given event.
 * Primary pool = rules matching event class or grade.
 * Overflow: if a non-matching teacher is strictly less loaded than the best
 * matching teacher, they absorb the overflow (e.g. קלופר taking grade ט
 * events when grade-ט teachers are busier than her).
 * Falls back to all eligible rules when nothing matches.
 */
function pickTeacher(
  eligibleRules: TeacherAssignmentRule[],
  event: Event,
  loadCount: Map<number, number>,
): TeacherAssignmentRule {
  const matchingRules = eligibleRules.filter((rule) => {
    const classMatch = rule.classRulesJson?.some(
      (c) => c.classReferenceId === event.studentClassReferenceId,
    );
    const gradeMatch = rule.gradeRulesJson?.some(
      (g) => g.grade === event.grade?.toString(),
    );
    return classMatch || gradeMatch;
  });

  if (matchingRules.length === 0) return pickBestRule(eligibleRules, loadCount);

  const bestMatch = pickBestRule(matchingRules, loadCount);

  // Overflow: non-matching teacher takes the event if strictly less loaded
  if (matchingRules.length < eligibleRules.length) {
    const bestOverall = pickBestRule(eligibleRules, loadCount);
    if (getWeightedLoad(bestOverall, loadCount) < getWeightedLoad(bestMatch, loadCount)) {
      return bestOverall;
    }
  }

  return bestMatch;
}

/**
 * Assigns a teacher to a single event using the rules engine.
 * Pure synchronous function — no DB calls. The caller loads all data
 * upfront and is responsible for saving the returned ftaUpdate.
 *
 * The event must have the `student` relation loaded (event.student).
 * Load balancing uses the provided loadCount map (caller controls scope,
 * e.g. all yearly events or just the current batch).
 *
 * Resolution order:
 * 1. Existing family default (fta.teacherReferenceId)
 * 2. Active rules matching event class or grade, balanced by loadCount
 * 3. Any active eligible rule, if nothing matches class/grade
 *
 * @param event               Event to assign (must have .student loaded).
 * @param allRules            Active TeacherAssignmentRule rows for this user+year.
 * @param fta                 Existing FamilyTeacherAssignment for this family, or null.
 * @param loadCount           Map of teacherId → current event count for balancing.
 * @param candidateTeacherIds Optional filter: only rules whose teacher is in this list are eligible.
 * @returns chosenTeacherId: number | null
 *          ftaUpdate: FamilyTeacherAssignment record to save, or null if no assignment made.
 */
export function assignTeacher(
  event: Event,
  allRules: TeacherAssignmentRule[],
  fta: FamilyTeacherAssignment | null,
  loadCount: Map<number, number>,
  candidateTeacherIds?: number[],
): { chosenTeacherId: number | null; ftaUpdate: Partial<FamilyTeacherAssignment> | null } {
  const familyId = event.student?.familyReferenceId ?? null;
  if (!familyId) return { chosenTeacherId: null, ftaUpdate: null };

  const year = event.year ?? getCurrentHebrewYear();
  let chosenTeacherId: number | null = null;
  let source: string;

  if (fta?.teacherReferenceId) {
    chosenTeacherId = fta.teacherReferenceId;
    source = 'family_default';
  } else {
    if (allRules.length === 0) return { chosenTeacherId: null, ftaUpdate: null };

    chosenTeacherId = pickTeacher(allRules, event, loadCount).teacherReferenceId;
    source = 'rules';
  }

  if (!chosenTeacherId) return { chosenTeacherId: null, ftaUpdate: null };

  const record: Partial<FamilyTeacherAssignment> = fta ?? {
    userId: event.userId,
    year,
    familyReferenceId: familyId,
    historyJson: [],
  };
  record.teacherReferenceId = chosenTeacherId;
  record.historyJson = [
    ...(record.historyJson ?? []),
    { eventId: event.id, teacherReferenceId: chosenTeacherId, assignedAt: new Date().toISOString(), source },
  ];

  return { chosenTeacherId, ftaUpdate: record };
}

/**
 * Assigns teachers to a batch of events using the rules engine.
 * Pure synchronous function — no DB calls. The caller loads all data
 * upfront and is responsible for saving the returned ftaUpdates.
 *
 * Events must have the `student` relation loaded (event.student).
 * Events in the same family always get the same teacher.
 * Load balancing counts only assignments made within this batch.
 *
 * @param events              Events to assign (must have .student loaded).
 * @param allRules            Active TeacherAssignmentRule rows for this user+year.
 * @param ftaMap              Pre-loaded map of familyReferenceId → FamilyTeacherAssignment.
 * @param candidateTeacherIds Optional filter: only rules whose teacher is in this list are eligible.
 * @returns assignmentMap: Map<eventId, chosenTeacherId | null>
 *          ftaUpdates: FamilyTeacherAssignment records to save (both new and updated).
 */
export function assignTeachersBatch(
  events: Event[],
  allRules: TeacherAssignmentRule[],
  ftaMap: Map<string, FamilyTeacherAssignment>,
  candidateTeacherIds?: number[],
): { assignmentMap: Map<number, number | null>; ftaUpdates: Partial<FamilyTeacherAssignment>[] } {
  const assignmentMap = new Map<number, number | null>();
  const ftaUpdates: Partial<FamilyTeacherAssignment>[] = [];

  if (events.length === 0) return { assignmentMap, ftaUpdates };

  const userId = events[0].userId;
  const year = events[0].year ?? getCurrentHebrewYear();
  const now = new Date().toISOString();

  const eligibleRules = allRules.length === 0 && candidateTeacherIds?.length
    ? candidateTeacherIds.map((id) => ({ teacherReferenceId: id, customRatio: 1 } as TeacherAssignmentRule))
    : allRules;

  // Group events by family; events with no familyId are marked unassigned immediately
  const eventsByFamily = events.reduce((acc, event) => {
    const familyId = event.student?.familyReferenceId ?? null;
    if (!familyId) { assignmentMap.set(event.id, null); return acc; }
    (acc[familyId] ??= []).push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Track in-batch load: families processed earlier influence later families
  const batchLoadCount = new Map<number, number>();

  for (const [familyId, familyEvents] of Object.entries(eventsByFamily)) {
    const fta = ftaMap.get(familyId);
    let chosenTeacherId: number | null = null;
    let source: string;

    if (fta?.teacherReferenceId) {
      chosenTeacherId = fta.teacherReferenceId;
      source = 'family_default';
    } else if (eligibleRules.length > 0) {
      chosenTeacherId = pickTeacher(eligibleRules, familyEvents[0], batchLoadCount).teacherReferenceId;
      source = 'rules';
    }

    if (!chosenTeacherId) {
      for (const ev of familyEvents) assignmentMap.set(ev.id, null);
      continue;
    }

    batchLoadCount.set(chosenTeacherId, (batchLoadCount.get(chosenTeacherId) ?? 0) + familyEvents.length);
    for (const ev of familyEvents) assignmentMap.set(ev.id, chosenTeacherId);

    const record: Partial<FamilyTeacherAssignment> = fta ?? {
      userId,
      year,
      familyReferenceId: familyId,
      historyJson: [],
    };
    record.teacherReferenceId = chosenTeacherId;
    record.historyJson = [
      ...(record.historyJson ?? []),
      ...familyEvents.map((ev) => ({
        eventId: ev.id,
        teacherReferenceId: chosenTeacherId!,
        assignedAt: now,
        source,
      })),
    ];
    ftaUpdates.push(record);
  }

  return { assignmentMap, ftaUpdates };
}
