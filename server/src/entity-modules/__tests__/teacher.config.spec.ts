import teacherConfig from '../teacher.config';
import { Teacher } from 'src/db/entities/Teacher.entity';

describe('TeacherConfig', () => {
  it('should use Teacher entity', () => {
    expect(teacherConfig.entity).toBe(Teacher);
  });

  it('should return correct export headers', () => {
    const fields = ['tz', 'name', 'phone', 'phone2', 'email', 'displayName'];
    const headers = teacherConfig.exporter.getExportHeaders(fields);
    
    expect(headers).toEqual(expect.arrayContaining([
      { value: 'tz', label: 'תז' },
      { value: 'name', label: 'שם' },
      { value: 'phone', label: 'טלפון' },
      { value: 'phone2', label: 'טלפון 2' },
      { value: 'email', label: 'כתובת מייל' },
      { value: 'displayName', label: 'שם לתצוגה' },
    ]));
  });
});