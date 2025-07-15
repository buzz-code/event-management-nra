import studentClassConfig from '../student-class.config';
import { StudentClass } from 'src/db/entities/StudentClass.entity';

describe('student-class.config', () => {
  it('should export a valid config object', () => {
    expect(studentClassConfig).toBeDefined();
    expect(studentClassConfig.entity).toBe(StudentClass);
  });

  it('should have correct query configuration', () => {
    expect(studentClassConfig.query).toBeDefined();
    expect(studentClassConfig.query.join).toEqual({
      student: { eager: false },
      class: { eager: false },
    });
  });

  it('should have exporter configuration', () => {
    expect(studentClassConfig.exporter).toBeDefined();
    expect(studentClassConfig.exporter.getExportHeaders).toBeDefined();
    expect(typeof studentClassConfig.exporter.getExportHeaders).toBe('function');
  });

  it('should return correct export headers', () => {
    const headers = studentClassConfig.exporter.getExportHeaders([]);
    expect(headers).toEqual([
      { value: 'student.name', label: 'שם תלמיד' },
      { value: 'class.name', label: 'שם כיתה' },
      { value: 'year', label: 'שנה' },
    ]);
  });

  it('should have processReqForExport function', () => {
    expect(studentClassConfig.exporter.processReqForExport).toBeDefined();
    expect(typeof studentClassConfig.exporter.processReqForExport).toBe('function');
  });

  it('processReqForExport should modify request and call inner function', () => {
    const mockInnerFunc = jest.fn();
    const mockReq = {
      options: {
        query: {
          join: {}
        }
      }
    };

    studentClassConfig.exporter.processReqForExport(mockReq as any, mockInnerFunc);

    expect(mockReq.options.query.join).toEqual({
      student: { eager: true },
      class: { eager: true },
    });
    expect(mockInnerFunc).toHaveBeenCalledWith(mockReq);
  });
});