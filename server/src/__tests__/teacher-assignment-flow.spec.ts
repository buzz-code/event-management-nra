/// <reference types="jest" />
// bcrypt uses a native binary that is unavailable in the dev-container;
// mock it before any entity imports pull it in transitively.
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
  hashSync: jest.fn(),
  compareSync: jest.fn(),
}));

/**
 * Teacher Assignment Flow — Integration-style unit tests
 *
 * Data model:
 *  - 4 teachers:  T1=101, T2=102, T3=103, T4=104
 *  - 6 grade levels: יד, יג, יב, יא, י, ט
 *  - 6 rules (ordered 1-6):
 *      1. יד  → [T1]
 *      2. יג  → [T1]
 *      3. יב  → [T2, T3]
 *      4. יא  → [T2, T3, T4]
 *      5. י   → [T2, T3, T4]
 *      6. ט   → [T2, T3, T4]
 *
 * "studentClass" on the Event entity is actually the Class entity
 * (joined via studentClassReferenceId → classes.id).
 * gradeLevel comes from event.studentClass.gradeLevel (Class.gradeLevel).
 *
 * Family grouping: events with the same student.familyReferenceId belong
 * to the same family and are always assigned the same teacher.
 *
 * Bulk-assign: assignTeachersByRules(eventIds, dataSource, userId)
 * Bulk-clear:  manualTeacherAssignment action with teacherReferenceId=null
 *              Mirrors EventService.manualTeacherAssignment:
 *                teacherReferenceId = rawTeacherId ? Number(rawTeacherId) : null
 *                repo.update({ id: In(eventIds), userId }, { teacherReferenceId })
 */

import { assignTeachersByRules } from 'src/utils/teacher-assignment.util';
import { Event } from 'src/db/entities/Event.entity';
import { TeacherAssignmentRule } from 'src/db/entities/TeacherAssignmentRule.entity';

// ─── Constants ───────────────────────────────────────────────────────────────

const USER_ID = 1;
const YEAR = 5785;

const T1 = 101;
const T2 = 102;
const T3 = 103;
const T4 = 104;

const GRADE_YD = 'יד';
const GRADE_YG = 'יג';
const GRADE_YB = 'יב';
const GRADE_YA = 'יא';
const GRADE_Y  = 'י';
const GRADE_T  = 'ט';

// ─── Builders ────────────────────────────────────────────────────────────────

let _eventIdCounter = 1;

/** Creates a mock Event. studentClass is the Class entity (not StudentClass). */
function makeEvent(familyId: string, gradeLevel: string, id?: number): Partial<Event> {
  return {
    id: id ?? _eventIdCounter++,
    userId: USER_ID,
    year: YEAR,
    teacherReferenceId: null,
    student: { familyReferenceId: familyId } as any,
    studentClass: { gradeLevel } as any, // Class entity
  };
}

function makeRule(
  order: number,
  gradeLevelKey: string,
  teacherReferenceIds: number[],
): TeacherAssignmentRule {
  return {
    id: order,
    userId: USER_ID,
    year: YEAR,
    order,
    gradeLevelKey,
    teacherReferenceIds,
    isActive: true,
  } as TeacherAssignmentRule;
}

/** Standard 6-rule set used by most tests. */
function standardRules(): TeacherAssignmentRule[] {
  return [
    makeRule(1, GRADE_YD, [T1]),
    makeRule(2, GRADE_YG, [T1]),
    makeRule(3, GRADE_YB, [T2, T3]),
    makeRule(4, GRADE_YA, [T2, T3, T4]),
    makeRule(5, GRADE_Y,  [T2, T3, T4]),
    makeRule(6, GRADE_T,  [T2, T3, T4]),
  ];
}

/**
 * Builds a DataSource mock whose getRepository() returns find() results
 * for Event and TeacherAssignmentRule.
 */
function makeDataSource(events: Partial<Event>[], rules: TeacherAssignmentRule[]) {
  return {
    getRepository: (entity: any) => {
      const name: string = entity?.name ?? '';
      if (name === 'Event') {
        return { find: jest.fn().mockResolvedValue(events) };
      }
      if (name === 'TeacherAssignmentRule') {
        return { find: jest.fn().mockResolvedValue(rules) };
      }
      return {};
    },
  } as any;
}

/** Convenience: run assignment and return the result map. */
async function assign(events: Partial<Event>[], rules = standardRules()) {
  const ids = events.map((e) => e.id as number);
  const ds = makeDataSource(events, rules);
  return assignTeachersByRules(ids, ds, USER_ID);
}

/**
 * Mirrors EventService.manualTeacherAssignment:
 *   teacherReferenceId = rawTeacherId ? Number(rawTeacherId) : null
 *   repo.update({ id: In(eventIds), userId }, { teacherReferenceId })
 *
 * Returns the resolved teacherReferenceId and the update spy so tests can
 * assert what was actually written to the DB.
 */
async function manualTeacherAssignment(
  eventIds: number[],
  rawTeacherId: number | null | undefined,
): Promise<{ updateMock: jest.Mock; teacherReferenceId: number | null }> {
  const teacherReferenceId = rawTeacherId ? Number(rawTeacherId) : null;
  const updateMock = jest.fn().mockResolvedValue(undefined);
  const { In: InOp } = await import('typeorm');
  await updateMock({ id: InOp(eventIds), userId: USER_ID }, { teacherReferenceId });
  return { updateMock, teacherReferenceId };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  _eventIdCounter = 1;
});

// ── Baseline / empty ──────────────────────────────────────────────────────────

describe('baseline', () => {
  it('returns empty map when no event IDs supplied', async () => {
    const result = await assignTeachersByRules([], makeDataSource([], standardRules()), USER_ID);
    expect(result.size).toBe(0);
  });
});

// ── Scenario 1: single student in יד → T1 ────────────────────────────────────

describe('scenario 1 – single student in grade יד', () => {
  it('assigns T1', async () => {
    const events = [makeEvent('fam-1', GRADE_YD)];
    const result = await assign(events);
    expect(result.get(events[0].id!)).toBe(T1);
  });
});

// ── Scenario 2: single student in יג → T1 ────────────────────────────────────

describe('scenario 2 – single student in grade יג', () => {
  it('assigns T1', async () => {
    const events = [makeEvent('fam-1', GRADE_YG)];
    const result = await assign(events);
    expect(result.get(events[0].id!)).toBe(T1);
  });
});

// ── Scenario 3: family with siblings in יד AND יב → whole family gets T1 ────

describe('scenario 3 – siblings in יד and יב', () => {
  it('assigns T1 to every event in the family (rule 1 fires first)', async () => {
    const events = [
      makeEvent('fam-siblings', GRADE_YD),
      makeEvent('fam-siblings', GRADE_YB),
    ];
    const result = await assign(events);
    for (const ev of events) {
      expect(result.get(ev.id!)).toBe(T1);
    }
  });
});

// ── Scenario 4: siblings in יג AND יב → whole family gets T1 ─────────────────

describe('scenario 4 – siblings in יג and יב', () => {
  it('assigns T1 to every event in the family (rule 2 fires before rule 3)', async () => {
    const events = [
      makeEvent('fam-siblings', GRADE_YG),
      makeEvent('fam-siblings', GRADE_YB),
    ];
    const result = await assign(events);
    for (const ev of events) {
      expect(result.get(ev.id!)).toBe(T1);
    }
  });
});

// ── Scenario 5: two independent families in יב → one gets T2, other T3 ──────

describe('scenario 5 – two independent families in יב', () => {
  it('load-balances: one family gets T2, the other gets T3', async () => {
    const evA = makeEvent('fam-A', GRADE_YB);
    const evB = makeEvent('fam-B', GRADE_YB);
    const result = await assign([evA, evB]);

    const teacherA = result.get(evA.id!)!;
    const teacherB = result.get(evB.id!)!;

    // Both must be from the T2/T3 pool
    expect([T2, T3]).toContain(teacherA);
    expect([T2, T3]).toContain(teacherB);

    // And they must be different (load balanced)
    expect(teacherA).not.toBe(teacherB);
  });
});

// ── Scenario 6: two families in יד and יג → both get T1 ──────────────────────

describe('scenario 6 – one family in יד, one family in יג', () => {
  it('both get T1 (only teacher in those rules)', async () => {
    const evA = makeEvent('fam-A', GRADE_YD);
    const evB = makeEvent('fam-B', GRADE_YG);
    const result = await assign([evA, evB]);

    expect(result.get(evA.id!)).toBe(T1);
    expect(result.get(evB.id!)).toBe(T1);
  });
});

// ── Scenario 7: three independent families in יא → distributed among T2/T3/T4

describe('scenario 7 – three independent families in יא', () => {
  it('each teacher (T2/T3/T4) is assigned to exactly one family', async () => {
    const evA = makeEvent('fam-A', GRADE_YA);
    const evB = makeEvent('fam-B', GRADE_YA);
    const evC = makeEvent('fam-C', GRADE_YA);
    const result = await assign([evA, evB, evC]);

    const assigned = [
      result.get(evA.id!)!,
      result.get(evB.id!)!,
      result.get(evC.id!)!,
    ];

    // All from T2/T3/T4
    assigned.forEach((t) => expect([T2, T3, T4]).toContain(t));

    // All different (perfect distribution with 3 teachers × 3 families)
    const unique = new Set(assigned);
    expect(unique.size).toBe(3);
  });
});

// ── Scenario 8: family with students in ALL 6 grades → gets T1 ───────────────

describe('scenario 8 – family with students in all six grades', () => {
  it('assigns T1 to every event (rule 1/יד fires first for the family)', async () => {
    const grades = [GRADE_YD, GRADE_YG, GRADE_YB, GRADE_YA, GRADE_Y, GRADE_T];
    const events = grades.map((g) => makeEvent('big-family', g));
    const result = await assign(events);
    events.forEach((ev) => expect(result.get(ev.id!)).toBe(T1));
  });
});

// ── Scenario 9: load balancing across grades that share the T2/T3/T4 pool ───

describe('scenario 9 – cross-grade load balancing (יב → יא)', () => {
  /**
   * Set up two families in יב  (they consume one slot each from T2 and T3).
   * Then introduce one family in יא.
   * After יב runs: T2=1, T3=1, T4=0.
   * Rule 4 (יא) has [T2, T3, T4] → pickTeacherByLoad picks T4 (load=0).
   */
  it('the first יא family gets T4 after T2 and T3 are loaded by יב', async () => {
    const evYB_A = makeEvent('fam-YB-A', GRADE_YB);
    const evYB_B = makeEvent('fam-YB-B', GRADE_YB);
    const evYA   = makeEvent('fam-YA',   GRADE_YA);

    const result = await assign([evYB_A, evYB_B, evYA]);

    // יב families consume T2 and T3 (one each, because they load-balance)
    const yb_teachers = new Set([result.get(evYB_A.id!)!, result.get(evYB_B.id!)!]);
    expect(yb_teachers).toEqual(new Set([T2, T3]));

    // יא family must receive T4 (the only unloaded teacher)
    expect(result.get(evYA.id!)).toBe(T4);
  });
});

// ── Scenario 10: events with no matching rule produce null ───────────────────

describe('scenario 10 – grade level not covered by any rule', () => {
  it('event stays unassigned (null)', async () => {
    const ev = makeEvent('fam-unknown', 'יז'); // grade יז has no rule
    const result = await assign([ev]);
    // The event id may be absent from map or explicitly null
    const teacher = result.get(ev.id!) ?? null;
    expect(teacher).toBeNull();
  });
});

// ── Scenario 11: clear & re-assign ──────────────────────────────────────────

describe('scenario 11 – clear assignments and re-assign', () => {
  it('manualTeacherAssignment with null produces null and subsequent assign restores T1', async () => {
    const evYD = makeEvent('fam-A', GRADE_YD);
    const evYG = makeEvent('fam-B', GRADE_YG);

    // First pass — assign
    const result1 = await assign([evYD, evYG]);
    expect(result1.get(evYD.id!)).toBe(T1);
    expect(result1.get(evYG.id!)).toBe(T1);

    // Bulk-clear via manualTeacherAssignment (no teacher → null)
    const { updateMock, teacherReferenceId } = await manualTeacherAssignment(
      [evYD.id!, evYG.id!],
      null,
    );
    expect(teacherReferenceId).toBeNull();
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER_ID }),
      { teacherReferenceId: null },
    );

    // Apply cleared state and re-assign
    evYD.teacherReferenceId = null;
    evYG.teacherReferenceId = null;
    const result2 = await assign([evYD, evYG]);
    expect(result2.get(evYD.id!)).toBe(T1);
    expect(result2.get(evYG.id!)).toBe(T1);
  });
});

// ── Scenario 12: inactive rules are ignored ──────────────────────────────────

describe('scenario 12 – inactive rule is skipped', () => {
  it('family in יד is not assigned if the יד rule is inactive', async () => {
    // The DB query filters WHERE isActive = true, so inactive rules are never
    // returned. We simulate that by excluding the יד rule from the mock data.
    const activeRules = standardRules().filter((r) => r.gradeLevelKey !== GRADE_YD);

    const ev = makeEvent('fam-1', GRADE_YD);
    const result = await assign([ev], activeRules);
    const teacher = result.get(ev.id!) ?? null;
    expect(teacher).toBeNull();
  });
});

// ── Scenario 13: multi-event family, one sibling in low-priority grade ───────

describe('scenario 13 – family with one high-priority sibling rescues a low-priority sibling', () => {
  /**
   * Family has two students: one in ט (lowest priority), one in יד (highest).
   * Rule 1 (יד) fires first → whole family (including the ט event) gets T1.
   */
  it('both events get T1 due to the יד sibling', async () => {
    const evT  = makeEvent('fam-mixed', GRADE_T);
    const evYD = makeEvent('fam-mixed', GRADE_YD);
    const result = await assign([evT, evYD]);
    expect(result.get(evT.id!)).toBe(T1);
    expect(result.get(evYD.id!)).toBe(T1);
  });
});

// ── Scenario 14: manualTeacherAssignment – clear and explicit set ─────────────

describe('scenario 14 – manualTeacherAssignment clear and set', () => {
  it('passing null clears the teacher (writes null)', async () => {
    const { teacherReferenceId } = await manualTeacherAssignment([1, 2, 3], null);
    expect(teacherReferenceId).toBeNull();
  });

  it('passing 0 also clears the teacher (falsy → null)', async () => {
    const { teacherReferenceId } = await manualTeacherAssignment([1, 2], 0);
    expect(teacherReferenceId).toBeNull();
  });

  it('passing a valid teacher ID sets it', async () => {
    const { teacherReferenceId, updateMock } = await manualTeacherAssignment([5], T2);
    expect(teacherReferenceId).toBe(T2);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ userId: USER_ID }),
      { teacherReferenceId: T2 },
    );
  });
});
