/// <reference types="jest" />
import { assignTeachersByRules, autoAssignTeacherForEvent } from 'src/utils/teacher-assignment.util';

describe('teacher-assignment util', () => {
  it('assignTeachersByRules returns empty map if no eventIds provided', async () => {
    const dataSourceMock: any = {};
    const result = await assignTeachersByRules([], dataSourceMock, 1);
    expect(result.size).toBe(0);
  });

  it('autoAssignTeacherForEvent returns null if event has no student familyReferenceId', async () => {
    const dataSourceMock: any = {};
    const eventMock: any = { id: 1, userId: 1, student: null };
    const studentMock: any = { id: 5, familyReferenceId: null };
    const result = await autoAssignTeacherForEvent(eventMock, studentMock, dataSourceMock);
    expect(result).toBeNull();
  });
});
