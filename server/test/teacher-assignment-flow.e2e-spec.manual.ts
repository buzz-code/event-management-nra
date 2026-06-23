/**
 * Teacher Assignment Flow — E2E tests against the live running server
 *
 * Prerequisites: docker-compose up -d client server database
 * Server expected at http://localhost:3011
 *
 * Strategy:
 *  1. Register a fresh isolated user for this test run (avoids conflicts with
 *     existing data).
 *  2. Create: 4 teachers, 6 classes (with gradeLevel), 6 solo-families × 1 student
 *     each, 6 sibling-families × 2 students each, events for all, and 6 rules.
 *  3. Run assignment scenarios using the `teacherAssociation` bulk action.
 *  4. Clear with `manualTeacherAssignment` (teacherReferenceId = null).
 *  5. Delete everything in afterAll.
 *
 * Family logic:
 *   familyReferenceId = `${userId}_${fatherName}_${motherName}_..._...`
 *   Siblings share the same fatherName + motherName → same familyReferenceId.
 *   The engine assigns the WHOLE family to one teacher: the first rule (by order)
 *   that matches ANY student in the family.
 *
 * Routes (snake_case entity name, no prefix):
 *   POST   /auth/register
 *   POST   /teacher, /class, /student, /student_class, /event_type, /event
 *   POST   /teacher_assignment_rule
 *   POST   /event/action?extra.action=...&extra.ids=...
 */

import axios, { AxiosInstance } from 'axios';

const BASE_URL = 'http://localhost:3011';
const RUN_ID = Date.now(); // unique per test run to avoid collisions

// ─── helpers ─────────────────────────────────────────────────────────────────

function api(cookie: string): AxiosInstance {
  return axios.create({
    baseURL: BASE_URL,
    headers: { Cookie: cookie },
    validateStatus: () => true, // never throw; let tests assert status codes
  });
}

async function registerUser(username: string, password: string): Promise<string> {
  const res = await axios.post(
    `${BASE_URL}/auth/register`,
    { username, password, name: username },
    { validateStatus: () => true, withCredentials: true },
  );
  if (res.status !== 200) {
    throw new Error(`Register failed (${res.status}): ${JSON.stringify(res.data)}`);
  }
  const setCookie = res.headers['set-cookie']?.[0] ?? '';
  const match = setCookie.match(/Authentication=[^;]+/);
  if (!match) throw new Error('No auth cookie in register response');
  return match[0];
}

async function loginUser(username: string, password: string): Promise<string> {
  const res = await axios.post(
    `${BASE_URL}/auth/login`,
    { username, password },
    { validateStatus: () => true },
  );
  if (res.status !== 200) {
    throw new Error(`Login failed (${res.status}): ${JSON.stringify(res.data)}`);
  }
  const setCookie = res.headers['set-cookie']?.[0] ?? '';
  const match = setCookie.match(/Authentication=[^;]+/);
  if (!match) throw new Error('No auth cookie in login response');
  return match[0];
}

async function createOne(http: AxiosInstance, route: string, body: object): Promise<any> {
  const res = await http.post(`/${route}`, body);
  if (res.status !== 201 && res.status !== 200) {
    throw new Error(`POST /${route} failed (${res.status}): ${JSON.stringify(res.data)}`);
  }
  return res.data;
}

async function deleteOne(http: AxiosInstance, route: string, id: number): Promise<void> {
  await http.delete(`/${route}/${id}`);
}

async function getOne(http: AxiosInstance, route: string, id: number): Promise<any> {
  const res = await http.get(`/${route}/${id}`);
  return res.data;
}

async function doAction(
  http: AxiosInstance,
  action: string,
  ids: number[],
  extra: Record<string, any> = {},
): Promise<any> {
  // The CrudRequestInterceptor parses extra.* params from the query string
  const params = new URLSearchParams({
    'extra.action': action,
    'extra.ids': ids.join(','),
    ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [`extra.${k}`, String(v)])),
  });
  const res = await http.post(`/event/action?${params.toString()}`);
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`doAction ${action} failed (${res.status}): ${JSON.stringify(res.data)}`);
  }
  return res.data;
}

// ─── Test data ────────────────────────────────────────────────────────────────

const GRADES = ['יד', 'יג', 'יב', 'יא', 'י', 'ט'] as const;
type Grade = (typeof GRADES)[number];

// Teacher names stable across assertions
const TEACHER_NAMES: Record<string, string> = {
  T1: `T1_${RUN_ID}`,
  T2: `T2_${RUN_ID}`,
  T3: `T3_${RUN_ID}`,
  T4: `T4_${RUN_ID}`,
};

// Assignment rules:
//  יד → [T1], יג → [T1], יב → [T2,T3], יא → [T2,T3,T4], י → [T2,T3,T4], ט → [T2,T3,T4]
function buildRules(
  teacherIds: Record<string, number>,
): { order: number; gradeLevelKey: Grade; teacherReferenceIds: number[] }[] {
  const { T1, T2, T3, T4 } = teacherIds;
  return [
    { order: 1, gradeLevelKey: 'יד', teacherReferenceIds: [T1] },
    { order: 2, gradeLevelKey: 'יג', teacherReferenceIds: [T1] },
    { order: 3, gradeLevelKey: 'יב', teacherReferenceIds: [T2, T3] },
    { order: 4, gradeLevelKey: 'יא', teacherReferenceIds: [T2, T3, T4] },
    { order: 5, gradeLevelKey: 'י',  teacherReferenceIds: [T2, T3, T4] },
    { order: 6, gradeLevelKey: 'ט',  teacherReferenceIds: [T2, T3, T4] },
  ];
}

/** A set of siblings sharing one familyReferenceId. */
interface FamilyData {
  grades: Grade[];
  studentIds: number[];
  eventIds: number[];
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('Teacher Assignment Flow (E2E – live server)', () => {
  let http: AxiosInstance;
  let cookie: string;

  // Created entity IDs for cleanup
  const createdTeacherIds: number[] = [];
  const createdClassIds: number[] = [];
  const createdStudentIds: number[] = [];
  const createdStudentClassIds: number[] = [];
  const createdEventTypeIds: number[] = [];
  const createdEventIds: number[] = [];
  const createdRuleIds: number[] = [];

  // Resolved references — solo students (one per grade, one family each)
  let teacherIds: Record<string, number>;
  let classIds: Record<Grade, number>;
  let studentIds: Record<Grade, number>;
  let eventTypeId: number;
  let eventIds: Record<Grade, number>;

  /**
   * Sibling families.
   * familyReferenceId = `${userId}_${fatherName}_${motherName}_..._...`
   * Siblings share the same fatherName + motherName → same familyReferenceId →
   * the engine assigns ALL their events to the SAME teacher.
   *
   *  highLow    : siblings in יד + יב  → whole family should get T1 (יד rule first)
   *  midLow     : siblings in יג + יב  → whole family should get T1 (יג rule first)
   *  poolMixed  : siblings in יב + יא  → whole family T2 or T3   (יב rule first)
   *  poolAlone  : single student in יב (family A for load-balance test)
   *  poolAlone2 : single student in יב (family B for load-balance test)
   *  rescued    : siblings in ט  + יד  → whole family should get T1 (rescued by יד)
   */
  let families: Record<
    'highLow' | 'midLow' | 'poolMixed' | 'poolAlone' | 'poolAlone2' | 'rescued',
    FamilyData
  >;

  // ── Setup ──────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const username = `e2e_assignment_${RUN_ID}`;
    const password = `TestPass_${RUN_ID}`;

    cookie = await registerUser(username, password);
    http = api(cookie);

    // --- Teachers ---
    for (const key of ['T1', 'T2', 'T3', 'T4'] as const) {
      const t = await createOne(http, 'teacher', { name: TEACHER_NAMES[key] });
      createdTeacherIds.push(t.id);
    }
    teacherIds = {
      T1: createdTeacherIds[0],
      T2: createdTeacherIds[1],
      T3: createdTeacherIds[2],
      T4: createdTeacherIds[3],
    };

    // --- Classes (one per grade level) ---
    classIds = {} as Record<Grade, number>;
    for (let i = 0; i < GRADES.length; i++) {
      const grade = GRADES[i];
      const cls = await createOne(http, 'class', {
        key: 1000 + i,
        name: `כיתה ${grade} (${RUN_ID})`,
        gradeLevel: grade,
      });
      classIds[grade] = cls.id;
      createdClassIds.push(cls.id);
    }

    // --- EventType ---
    const et = await createOne(http, 'event_type', {
      key: RUN_ID % 100000,
      name: `אירוע בדיקה ${RUN_ID}`,
    });
    eventTypeId = et.id;
    createdEventTypeIds.push(et.id);

    // ── Solo students (one per grade, each in their own family) ──────────────

    studentIds = {} as Record<Grade, number>;
    eventIds = {} as Record<Grade, number>;

    for (let i = 0; i < GRADES.length; i++) {
      const grade = GRADES[i];
      const tz = `${RUN_ID}${i}`.slice(-9);
      const student = await createOne(http, 'student', {
        tz,
        name: `תלמידה ${grade} (${RUN_ID})`,
        fatherName: `אב_solo_${grade}_${RUN_ID}`,
        motherName: `אם_solo_${grade}_${RUN_ID}`,
      });
      studentIds[grade] = student.id;
      createdStudentIds.push(student.id);

      const sc = await createOne(http, 'student_class', {
        studentReferenceId: student.id,
        classReferenceId: classIds[grade],
      });
      createdStudentClassIds.push(sc.id);

      const ev = await createOne(http, 'event', {
        name: `אירוע ${grade} ${RUN_ID}`,
        eventDate: '2026-06-01',
        studentReferenceId: student.id,
        eventTypeReferenceId: eventTypeId,
      });
      eventIds[grade] = ev.id;
      createdEventIds.push(ev.id);
    }

    // ── Sibling families ─────────────────────────────────────────────────────
    //
    // Each family is created by giving two students the SAME fatherName +
    // motherName. The server then derives the same familyReferenceId for both.

    let tzCounter = 90; // offset to avoid collisions with solo tzs

    async function createFamily(
      familyLabel: string,
      grades: Grade[],
    ): Promise<FamilyData> {
      const fatherName = `אב_${familyLabel}_${RUN_ID}`;
      const motherName = `אם_${familyLabel}_${RUN_ID}`;
      const sIds: number[] = [];
      const eIds: number[] = [];

      for (const grade of grades) {
        tzCounter++;
        const tz = `${RUN_ID}${tzCounter}`.slice(-9);
        const student = await createOne(http, 'student', {
          tz,
          name: `אחות ${grade} משפחת ${familyLabel} (${RUN_ID})`,
          fatherName,
          motherName,
        });
        sIds.push(student.id);
        createdStudentIds.push(student.id);

        const sc = await createOne(http, 'student_class', {
          studentReferenceId: student.id,
          classReferenceId: classIds[grade],
        });
        createdStudentClassIds.push(sc.id);

        const ev = await createOne(http, 'event', {
          name: `אירוע ${grade} משפחת ${familyLabel} ${RUN_ID}`,
          eventDate: '2026-06-01',
          studentReferenceId: student.id,
          eventTypeReferenceId: eventTypeId,
        });
        eIds.push(ev.id);
        createdEventIds.push(ev.id);
      }

      return { grades, studentIds: sIds, eventIds: eIds };
    }

    families = {
      highLow:    await createFamily('highLow',    ['יד', 'יב']),
      midLow:     await createFamily('midLow',     ['יג', 'יב']),
      poolMixed:  await createFamily('poolMixed',  ['יב', 'יא']),
      poolAlone:  await createFamily('poolAlone',  ['יב']),
      poolAlone2: await createFamily('poolAlone2', ['יב']),
      rescued:    await createFamily('rescued',    ['ט', 'יד']),
    };

    // --- TeacherAssignmentRules ---
    for (const rule of buildRules(teacherIds)) {
      const r = await createOne(http, 'teacher_assignment_rule', {
        ...rule,
        isActive: true,
      });
      createdRuleIds.push(r.id);
    }
  }, 120000);

  afterAll(async () => {
    if (!http) return;
    for (const id of createdRuleIds) await deleteOne(http, 'teacher_assignment_rule', id);
    for (const id of createdEventIds) await deleteOne(http, 'event', id);
    for (const id of createdEventTypeIds) await deleteOne(http, 'event_type', id);
    for (const id of createdStudentClassIds) await deleteOne(http, 'student_class', id);
    for (const id of createdStudentIds) await deleteOne(http, 'student', id);
    for (const id of createdClassIds) await deleteOne(http, 'class', id);
    for (const id of createdTeacherIds) await deleteOne(http, 'teacher', id);
  }, 120000);

  // helper: clear ALL event assignments (solo + sibling families)
  async function clearAllAssignments(): Promise<void> {
    await doAction(http, 'manualTeacherAssignment', createdEventIds);
    for (const grade of GRADES) {
      const ev = await getOne(http, 'event', eventIds[grade]);
      expect(ev.teacherReferenceId).toBeNull();
    }
  }

  // helper: assign a list of event IDs and read back their teacherReferenceIds
  async function assignAndReadIds(ids: number[]): Promise<Map<number, number | null>> {
    await doAction(http, 'teacherAssociation', ids);
    const result = new Map<number, number | null>();
    for (const id of ids) {
      const ev = await getOne(http, 'event', id);
      result.set(id, ev.teacherReferenceId ?? null);
    }
    return result;
  }

  // helper: assign solo-grade events and return grade→teacherId
  async function assignAndRead(grades: Grade[]): Promise<Record<Grade, number | null>> {
    const ids = grades.map((g) => eventIds[g]);
    const map = await assignAndReadIds(ids);
    const result = {} as Record<Grade, number | null>;
    for (const g of grades) result[g] = map.get(eventIds[g]) ?? null;
    return result;
  }

  // ── Smoke test ─────────────────────────────────────────────────────────────

  it('should have created all setup entities', () => {
    expect(createdTeacherIds).toHaveLength(4);
    expect(createdClassIds).toHaveLength(6);
    expect(createdRuleIds).toHaveLength(6);
    // 6 solo + 2+2+2+1+1+2 = 10 sibling students = 16 total
    expect(createdStudentIds).toHaveLength(16);
    expect(createdEventIds).toHaveLength(16);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  PART 1 — Solo-student scenarios (one family per grade)
  // ═══════════════════════════════════════════════════════════════════════════

  it('scenario 1 – יד and יג solo events are assigned to T1', async () => {
    await clearAllAssignments();
    const result = await assignAndRead(['יד', 'יג']);
    expect(result['יד']).toBe(teacherIds.T1);
    expect(result['יג']).toBe(teacherIds.T1);
  });

  it('scenario 2 – יב solo event is assigned to T2 or T3', async () => {
    await clearAllAssignments();
    const result = await assignAndRead(['יב']);
    expect([teacherIds.T2, teacherIds.T3]).toContain(result['יב']);
  });

  it('scenario 3 – יא, י, ט solo events each get a different teacher from {T2,T3,T4}', async () => {
    await clearAllAssignments();
    const result = await assignAndRead(['יא', 'י', 'ט']);
    const assigned = [result['יא']!, result['י']!, result['ט']!];
    const pool = [teacherIds.T2, teacherIds.T3, teacherIds.T4];
    for (const t of assigned) expect(pool).toContain(t);
    expect(new Set(assigned).size).toBe(3);
  });

  it('scenario 4 – all 6 solo grades: יד/יג → T1, rest → T2/T3/T4 pool', async () => {
    await clearAllAssignments();
    const result = await assignAndRead(['יד', 'יג', 'יב', 'יא', 'י', 'ט']);
    expect(result['יד']).toBe(teacherIds.T1);
    expect(result['יג']).toBe(teacherIds.T1);
    const pool = [teacherIds.T2, teacherIds.T3, teacherIds.T4];
    for (const g of ['יב', 'יא', 'י', 'ט'] as Grade[]) expect(pool).toContain(result[g]);
  });

  it('scenario 5 – manualTeacherAssignment with no teacher clears all events', async () => {
    await doAction(http, 'teacherAssociation', createdEventIds);
    const before = await getOne(http, 'event', eventIds['יד']);
    expect(before.teacherReferenceId).not.toBeNull();
    await clearAllAssignments();
  });

  it('scenario 6 – manualTeacherAssignment with teacherReferenceId sets that teacher', async () => {
    await clearAllAssignments();
    const ydId = eventIds['יד'];
    await doAction(http, 'manualTeacherAssignment', [ydId], { teacherReferenceId: teacherIds.T2 });
    const ev = await getOne(http, 'event', ydId);
    expect(ev.teacherReferenceId).toBe(teacherIds.T2);
    await doAction(http, 'manualTeacherAssignment', [ydId]);
  });

  it('scenario 7 – assign → clear → re-assign produces the same T1 for יד and יג', async () => {
    await clearAllAssignments();
    const first = await assignAndRead(['יד', 'יג']);
    expect(first['יד']).toBe(teacherIds.T1);
    expect(first['יג']).toBe(teacherIds.T1);
    await clearAllAssignments();
    const second = await assignAndRead(['יד', 'יג']);
    expect(second['יד']).toBe(teacherIds.T1);
    expect(second['יג']).toBe(teacherIds.T1);
  });

  it('scenario 8 – יב + יא + ט (3 solo families) are distributed across T2/T3/T4', async () => {
    await clearAllAssignments();
    const result = await assignAndRead(['יב', 'יא', 'ט']);
    const allThree = [result['יב']!, result['יא']!, result['ט']!];
    const pool = [teacherIds.T2, teacherIds.T3, teacherIds.T4];
    for (const t of allThree) expect(pool).toContain(t);
    expect(new Set(allThree).size).toBe(3);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  //  PART 2 — Family (sibling) scenarios
  // ═══════════════════════════════════════════════════════════════════════════

  it('scenario 9 – siblings in יד+יב: whole family gets T1 (יד rule fires first)', async () => {
    await clearAllAssignments();
    // Assign only this family's events
    const map = await assignAndReadIds(families.highLow.eventIds);
    // Both siblings must get T1 regardless of their individual grades
    for (const [, teacher] of map) {
      expect(teacher).toBe(teacherIds.T1);
    }
  });

  it('scenario 10 – siblings in יג+יב: whole family gets T1 (יג rule fires before יב)', async () => {
    await clearAllAssignments();
    const map = await assignAndReadIds(families.midLow.eventIds);
    for (const [, teacher] of map) {
      expect(teacher).toBe(teacherIds.T1);
    }
  });

  it('scenario 11 – siblings in יב+יא: whole family gets T2 or T3 (יב rule is first match)', async () => {
    await clearAllAssignments();
    const map = await assignAndReadIds(families.poolMixed.eventIds);
    const assigned = [...map.values()];
    // Both siblings must get the SAME teacher
    expect(new Set(assigned).size).toBe(1);
    // And that teacher must be from the יב pool
    expect([teacherIds.T2, teacherIds.T3]).toContain(assigned[0]);
  });

  it('scenario 12 – two independent families both in יב are load-balanced across T2/T3', async () => {
    await clearAllAssignments();
    // Assign both families together so the engine can balance
    const ids = [...families.poolAlone.eventIds, ...families.poolAlone2.eventIds];
    const map = await assignAndReadIds(ids);

    const teacherA = map.get(families.poolAlone.eventIds[0])!;
    const teacherB = map.get(families.poolAlone2.eventIds[0])!;

    // Both from the יב pool
    expect([teacherIds.T2, teacherIds.T3]).toContain(teacherA);
    expect([teacherIds.T2, teacherIds.T3]).toContain(teacherB);
    // Different teachers (load balanced)
    expect(teacherA).not.toBe(teacherB);
  });

  it('scenario 13 – sibling in ט is rescued by sibling in יד: whole family gets T1', async () => {
    await clearAllAssignments();
    // rescued family: grades ['ט', 'יד']
    const map = await assignAndReadIds(families.rescued.eventIds);
    for (const [, teacher] of map) {
      expect(teacher).toBe(teacherIds.T1);
    }
  });

  it('scenario 14 – siblings mixed with solo students: family assignment is isolated per family', async () => {
    await clearAllAssignments();
    // Assign: solo-יד (its own family) + family highLow (יד+יב siblings)
    const allIds = [eventIds['יד'], ...families.highLow.eventIds];
    const map = await assignAndReadIds(allIds);

    // Solo-יד family → T1
    expect(map.get(eventIds['יד'])).toBe(teacherIds.T1);
    // highLow sibling family → T1 (יד sibling matches first)
    for (const id of families.highLow.eventIds) {
      expect(map.get(id)).toBe(teacherIds.T1);
    }
  });
});
