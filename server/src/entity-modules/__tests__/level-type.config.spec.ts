import levelTypeConfig from '../level-type.config';
import { LevelType } from 'src/db/entities/LevelType.entity';

describe('level-type.config', () => {
  it('should export a valid config object', () => {
    expect(levelTypeConfig).toBeDefined();
    expect(levelTypeConfig.entity).toBe(LevelType);
  });

  it('should have correct query configuration', () => {
    expect(levelTypeConfig.query).toBeDefined();
    expect(levelTypeConfig.query.join).toEqual({
      events: { eager: false },
    });
  });

  it('should have exporter configuration', () => {
    expect(levelTypeConfig.exporter).toBeDefined();
    expect(levelTypeConfig.exporter.getExportHeaders).toBeDefined();
    expect(typeof levelTypeConfig.exporter.getExportHeaders).toBe('function');
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

  it('should have processReqForExport function', () => {
    expect(levelTypeConfig.exporter.processReqForExport).toBeDefined();
    expect(typeof levelTypeConfig.exporter.processReqForExport).toBe('function');
  });

  it('processReqForExport should modify request and call inner function', () => {
    const mockInnerFunc = jest.fn();
    const mockReq = {
      options: {
        query: {
          join: {},
        },
      },
    };

    levelTypeConfig.exporter.processReqForExport(mockReq as any, mockInnerFunc);

    expect(mockReq.options.query.join).toEqual({
      events: { eager: true },
    });
    expect(mockInnerFunc).toHaveBeenCalledWith(mockReq);
  });

  it('should have service configuration', () => {
    expect(levelTypeConfig.service).toBeDefined();
  });
});
