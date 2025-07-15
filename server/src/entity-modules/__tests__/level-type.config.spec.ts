import levelTypeConfig from '../level-type.config';
import { LevelType } from 'src/db/entities/LevelType.entity';

describe('LevelTypeConfig', () => {
  it('should use LevelType entity', () => {
    expect(levelTypeConfig.entity).toBe(LevelType);
  });

  it('should have correct query configuration', () => {
    expect(levelTypeConfig.query).toBeDefined();
    expect(levelTypeConfig.query.join).toBeDefined();
    expect(levelTypeConfig.query.join.events).toEqual({ eager: false });
  });

  it('should have exporter with processReqForExport function', () => {
    expect(levelTypeConfig.exporter).toBeDefined();
    expect(levelTypeConfig.exporter.processReqForExport).toBeDefined();
    expect(typeof levelTypeConfig.exporter.processReqForExport).toBe('function');
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
    
    const result = levelTypeConfig.exporter.processReqForExport(mockReq as any, mockInnerFunc);
    
    expect(mockReq.options.query.join).toEqual({
      events: { eager: true },
    });
    
    expect(mockInnerFunc).toHaveBeenCalledWith(mockReq);
    expect(result).toBe('result');
  });

  it('should return correct export headers', () => {
    const headers = levelTypeConfig.exporter.getExportHeaders([]);
    
    expect(headers).toEqual([
      { value: 'key', label: 'מפתח' },
      { value: 'name', label: 'שם הסוג רמה' },
      { value: 'description', label: 'תיאור' },
      { value: 'year', label: 'שנה' },
    ]);
  });

  it('should have service class defined', () => {
    expect(levelTypeConfig.service).toBeDefined();
  });
});