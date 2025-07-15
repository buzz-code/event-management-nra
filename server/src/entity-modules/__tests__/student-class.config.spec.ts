import studentClassConfig from '../student-class.config';
import { StudentClass } from 'src/db/entities/StudentClass.entity';

describe('StudentClassConfig', () => {
  it('should use StudentClass entity', () => {
    expect(studentClassConfig.entity).toBe(StudentClass);
  });

  it('should have correct query configuration', () => {
    expect(studentClassConfig.query).toBeDefined();
    expect(studentClassConfig.query.join).toBeDefined();
    expect(studentClassConfig.query.join.student).toEqual({ eager: false });
    expect(studentClassConfig.query.join.class).toEqual({ eager: false });
  });

  it('should have exporter with processReqForExport function', () => {
    expect(studentClassConfig.exporter).toBeDefined();
    expect(studentClassConfig.exporter.processReqForExport).toBeDefined();
    expect(typeof studentClassConfig.exporter.processReqForExport).toBe('function');
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
    
    const result = studentClassConfig.exporter.processReqForExport(mockReq as any, mockInnerFunc);
    
    expect(mockReq.options.query.join).toEqual({
      student: { eager: true },
      class: { eager: true },
    });
    
    expect(mockInnerFunc).toHaveBeenCalledWith(mockReq);
    expect(result).toBe('result');
  });

  it('should return correct export headers', () => {
    const headers = studentClassConfig.exporter.getExportHeaders([]);
    
    expect(headers).toEqual([
      { value: 'student.name', label: 'שם תלמיד' },
      { value: 'class.name', label: 'שם כיתה' },
      { value: 'year', label: 'שנה' },
    ]);
  });
});