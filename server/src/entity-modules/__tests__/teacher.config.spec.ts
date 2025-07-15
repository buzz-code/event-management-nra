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

  it('should have processReqForExport function', () => {
    expect(teacherConfig.exporter.processReqForExport).toBeDefined();
    expect(typeof teacherConfig.exporter.processReqForExport).toBe('function');
  });

  it('should configure eager loading for export', () => {
    const mockReq = {
      options: {
        query: {
          join: {}
        }
      }
    };
    
    const mockInnerFunc = jest.fn().mockReturnValue('result');
    
    const result = teacherConfig.exporter.processReqForExport(mockReq as any, mockInnerFunc);
    
    expect(mockReq.options.query.join).toEqual({
      user: { eager: true },
      ownUser: { eager: true },
    });
    
    expect(mockInnerFunc).toHaveBeenCalledWith(mockReq);
    expect(result).toBe('result');
  });

  it('should have correct query configuration', () => {
    expect(teacherConfig.query).toBeDefined();
    expect(teacherConfig.query.join).toBeDefined();
    expect(teacherConfig.query.join.user).toEqual({ eager: false });
    expect(teacherConfig.query.join.ownUser).toEqual({ eager: false });
    expect(teacherConfig.query.join.events).toEqual({ eager: false });
  });

  it('should have crudAuth configuration', () => {
    expect(teacherConfig.crudAuth).toBeDefined();
    // crudAuth is a filter object, not a function
    expect(typeof teacherConfig.crudAuth).toBe('object');
  });
});
