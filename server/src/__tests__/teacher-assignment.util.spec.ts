import { assignTeacher, assignTeachersBatch } from 'src/utils/teacher-assignment.util';

jest.mock('@shared/utils/entity/year.util', () => ({
  getCurrentHebrewYear: () => 5784,
}));

// Plain-object helpers — no TypeORM/NestJS wiring needed for pure functions
function makeEvent(overrides: any = {}): any {
  return {
    id: 1,
    userId: 1,
    year: 5784,
    student: { familyReferenceId: 'fam1' },
    studentClassReferenceId: 'class1',
    grade: '9',
    ...overrides,
  };
}

function makeRule(overrides: any = {}): any {
  return {
    teacherReferenceId: 10,
    customRatio: 1,
    classRulesJson: null,
    gradeRulesJson: null,
    isActive: true,
    ...overrides,
  };
}

function makeFta(overrides: any = {}): any {
  return {
    familyReferenceId: 'fam1',
    userId: 1,
    year: 5784,
    teacherReferenceId: 20,
    historyJson: [],
    ...overrides,
  };
}

describe('assignTeacher', () => {
  it('returns null when event has no familyReferenceId', () => {
    const event = makeEvent({ student: null });
    const result = assignTeacher(event, [makeRule()], null, new Map());
    expect(result.chosenTeacherId).toBeNull();
    expect(result.ftaUpdate).toBeNull();
  });

  it('returns null when no FTA and no rules', () => {
    const event = makeEvent();
    const result = assignTeacher(event, [], null, new Map());
    expect(result.chosenTeacherId).toBeNull();
    expect(result.ftaUpdate).toBeNull();
  });

  it('picks teacher from rules when no FTA', () => {
    const event = makeEvent();
    const result = assignTeacher(event, [makeRule({ teacherReferenceId: 42 })], null, new Map());
    expect(result.chosenTeacherId).toBe(42);
  });

  it('uses existing FTA teacher over rules', () => {
    const fta = makeFta({ teacherReferenceId: 99 });
    const result = assignTeacher(makeEvent(), [makeRule({ teacherReferenceId: 10 })], fta, new Map());
    expect(result.chosenTeacherId).toBe(99);
  });

  it('records a history entry on ftaUpdate', () => {
    const event = makeEvent({ id: 7 });
    const result = assignTeacher(event, [makeRule({ teacherReferenceId: 42 })], null, new Map());
    expect(result.ftaUpdate?.historyJson).toHaveLength(1);
    expect(result.ftaUpdate?.historyJson[0].eventId).toBe(7);
    expect(result.ftaUpdate?.historyJson[0].teacherReferenceId).toBe(42);
  });

  it('appends history when FTA already has history entries', () => {
    const fta = makeFta({ teacherReferenceId: 99, historyJson: [{ eventId: 1, teacherReferenceId: 99 }] });
    const result = assignTeacher(makeEvent({ id: 2 }), [], fta, new Map());
    expect(result.ftaUpdate?.historyJson).toHaveLength(2);
  });
});

describe('assignTeachersBatch', () => {
  it('returns empty maps when events list is empty', () => {
    const { assignmentMap, ftaUpdates } = assignTeachersBatch([], [], new Map());
    expect(assignmentMap.size).toBe(0);
    expect(ftaUpdates).toHaveLength(0);
  });

  it('marks events with no familyId as null', () => {
    const event = makeEvent({ id: 1, student: null });
    const { assignmentMap } = assignTeachersBatch([event], [makeRule()], new Map());
    expect(assignmentMap.get(1)).toBeNull();
  });

  it('assigns the same teacher to all events in the same family', () => {
    const events = [
      makeEvent({ id: 1, student: { familyReferenceId: 'fam1' } }),
      makeEvent({ id: 2, student: { familyReferenceId: 'fam1' } }),
      makeEvent({ id: 3, student: { familyReferenceId: 'fam1' } }),
    ];
    const { assignmentMap } = assignTeachersBatch(events, [makeRule({ teacherReferenceId: 10 })], new Map());
    expect(assignmentMap.get(1)).toBe(assignmentMap.get(2));
    expect(assignmentMap.get(2)).toBe(assignmentMap.get(3));
  });

  it('uses FTA teacher over rules', () => {
    const event = makeEvent({ id: 1, student: { familyReferenceId: 'fam1' } });
    const ftaMap = new Map([['fam1', makeFta({ familyReferenceId: 'fam1', teacherReferenceId: 99 })]]);
    const { assignmentMap } = assignTeachersBatch([event], [makeRule({ teacherReferenceId: 10 })], ftaMap);
    expect(assignmentMap.get(1)).toBe(99);
  });

  it('load balances: lower-load teacher gets the next family', () => {
    // fam1..fam5 are locked to teacher 11 via FTA → batchLoadCount[11] = 5
    // fam6 has no FTA → should go to teacher 10 (load = 0)
    const ftaMap = new Map<string, any>(
      Array.from({ length: 5 }, (_, i) => [
        `fam${i + 1}`,
        makeFta({ familyReferenceId: `fam${i + 1}`, teacherReferenceId: 11 }),
      ]),
    );
    const events = [
      ...Array.from({ length: 5 }, (_, i) =>
        makeEvent({ id: i + 1, student: { familyReferenceId: `fam${i + 1}` } }),
      ),
      makeEvent({ id: 6, student: { familyReferenceId: 'fam6' } }),
    ];
    const rules = [makeRule({ teacherReferenceId: 10 }), makeRule({ teacherReferenceId: 11 })];
    const { assignmentMap } = assignTeachersBatch(events, rules, ftaMap);
    expect(assignmentMap.get(6)).toBe(10);
  });

  it('customRatio=2 lets a teacher absorb double load before being considered busier', () => {
    // teacher 11 (ratio=2) gets fam1 + fam2 via FTA → batchLoadCount[11] = 2, weighted = 2/2 = 1
    // teacher 10 (ratio=1) has 0 load → weighted = 0/1 = 0 → wins fam3
    const ftaMap = new Map([
      ['fam1', makeFta({ familyReferenceId: 'fam1', teacherReferenceId: 11 })],
      ['fam2', makeFta({ familyReferenceId: 'fam2', teacherReferenceId: 11 })],
    ]);
    const events = [
      makeEvent({ id: 1, student: { familyReferenceId: 'fam1' } }),
      makeEvent({ id: 2, student: { familyReferenceId: 'fam2' } }),
      makeEvent({ id: 3, student: { familyReferenceId: 'fam3' } }),
    ];
    const rules = [
      makeRule({ teacherReferenceId: 10, customRatio: 1 }),
      makeRule({ teacherReferenceId: 11, customRatio: 2 }),
    ];
    const { assignmentMap } = assignTeachersBatch(events, rules, ftaMap);
    expect(assignmentMap.get(3)).toBe(10);
  });

  it('customRatio=0 is treated as 1 (prevents Infinity load)', () => {
    // teacher 10 (ratio=0, treated as 1) gets fam1..fam5 via FTA → weighted = 5/1 = 5
    // teacher 11 (ratio=1) has 0 load → weighted = 0/1 = 0 → wins fam6
    const ftaMap = new Map<string, any>(
      Array.from({ length: 5 }, (_, i) => [
        `fam${i + 1}`,
        makeFta({ familyReferenceId: `fam${i + 1}`, teacherReferenceId: 10 }),
      ]),
    );
    const events = [
      ...Array.from({ length: 5 }, (_, i) =>
        makeEvent({ id: i + 1, student: { familyReferenceId: `fam${i + 1}` } }),
      ),
      makeEvent({ id: 6, student: { familyReferenceId: 'fam6' } }),
    ];
    const rules = [
      makeRule({ teacherReferenceId: 10, customRatio: 0 }),
      makeRule({ teacherReferenceId: 11, customRatio: 1 }),
    ];
    const { assignmentMap } = assignTeachersBatch(events, rules, ftaMap);
    expect(assignmentMap.get(6)).toBe(11);
  });

  it('customRatio=null is treated as 1', () => {
    const event = makeEvent({ id: 1, student: { familyReferenceId: 'fam1' } });
    const { assignmentMap } = assignTeachersBatch([event], [makeRule({ teacherReferenceId: 10, customRatio: null })], new Map());
    expect(assignmentMap.get(1)).toBe(10);
  });

  it('customRatio=negative is treated as 1', () => {
    const event = makeEvent({ id: 1, student: { familyReferenceId: 'fam1' } });
    const { assignmentMap } = assignTeachersBatch([event], [makeRule({ teacherReferenceId: 10, customRatio: -5 })], new Map());
    expect(assignmentMap.get(1)).toBe(10);
  });

  it('class-matching rule wins over non-matching when equally loaded', () => {
    const event = makeEvent({ id: 1, student: { familyReferenceId: 'fam1' }, studentClassReferenceId: 'classA', grade: null });
    const rules = [
      makeRule({ teacherReferenceId: 10, classRulesJson: [{ classReferenceId: 'classA' }] }),
      makeRule({ teacherReferenceId: 11, classRulesJson: null, gradeRulesJson: null }),
    ];
    const { assignmentMap } = assignTeachersBatch([event], rules, new Map());
    expect(assignmentMap.get(1)).toBe(10);
  });

  it('grade-matching rule wins over non-matching when equally loaded', () => {
    const event = makeEvent({ id: 1, student: { familyReferenceId: 'fam1' }, studentClassReferenceId: null, grade: '9' });
    const rules = [
      makeRule({ teacherReferenceId: 10, gradeRulesJson: [{ grade: '9' }] }),
      makeRule({ teacherReferenceId: 11, classRulesJson: null, gradeRulesJson: null }),
    ];
    const { assignmentMap } = assignTeachersBatch([event], rules, new Map());
    expect(assignmentMap.get(1)).toBe(10);
  });

  it('overflow: non-matching teacher absorbs event when strictly less loaded', () => {
    // teacher 10 matches class1 but has 5 events → load 5
    // teacher 11 matches nothing, has 0 events → load 0 → absorbs overflow for fam6
    const ftaMap = new Map<string, any>(
      Array.from({ length: 5 }, (_, i) => [
        `fam${i + 1}`,
        makeFta({ familyReferenceId: `fam${i + 1}`, teacherReferenceId: 10 }),
      ]),
    );
    const events = [
      ...Array.from({ length: 5 }, (_, i) =>
        makeEvent({ id: i + 1, student: { familyReferenceId: `fam${i + 1}` }, studentClassReferenceId: 'class1' }),
      ),
      makeEvent({ id: 6, student: { familyReferenceId: 'fam6' }, studentClassReferenceId: 'class1' }),
    ];
    const rules = [
      makeRule({ teacherReferenceId: 10, classRulesJson: [{ classReferenceId: 'class1' }] }),
      makeRule({ teacherReferenceId: 11, classRulesJson: null, gradeRulesJson: null }),
    ];
    const { assignmentMap } = assignTeachersBatch(events, rules, ftaMap);
    expect(assignmentMap.get(6)).toBe(11);
  });

  it('produces ftaUpdate records for newly assigned families', () => {
    const events = [makeEvent({ id: 1, student: { familyReferenceId: 'fam1' } })];
    const { ftaUpdates } = assignTeachersBatch(events, [makeRule({ teacherReferenceId: 10 })], new Map());
    expect(ftaUpdates).toHaveLength(1);
    expect(ftaUpdates[0].teacherReferenceId).toBe(10);
    expect(ftaUpdates[0].familyReferenceId).toBe('fam1');
  });

  it('does not produce ftaUpdate for events with no familyId', () => {
    const event = makeEvent({ id: 1, student: null });
    const { ftaUpdates } = assignTeachersBatch([event], [makeRule()], new Map());
    expect(ftaUpdates).toHaveLength(0);
  });
});
