import teacherConfig from '../teacher.config';
import { Teacher } from 'src/db/entities/Teacher.entity';

describe('TeacherConfig', () => {
  it('should use Teacher entity', () => {
    expect(teacherConfig.entity).toBe(Teacher);
  });

  it('should return correct export headers', () => {
    const headers = teacherConfig.exporter.getExportHeaders([]);

    expect(headers).toEqual([
      { value: 'tz', label: 'ת.ז.' },
      { value: 'name', label: 'שם' },
      { value: 'ownUser.email', label: 'כתובת מייל' },
      { value: 'ownUser.username', label: 'שם משתמש' },
    ]);
  });
});
