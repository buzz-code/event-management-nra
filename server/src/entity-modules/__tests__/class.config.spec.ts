import classConfig from '../class.config';
import { Class } from 'src/db/entities/Class.entity';

describe('class.config', () => {
  it('should export a valid config object', () => {
    expect(classConfig).toBeDefined();
    expect(classConfig.entity).toBe(Class);
  });

  it('should have correct query configuration', () => {
    expect(classConfig.query).toBeDefined();
    expect(classConfig.query.join).toEqual({
      students: { eager: false },
    });
  });

  it('should have exporter configuration', () => {
    expect(classConfig.exporter).toBeDefined();
    expect(classConfig.exporter.getExportHeaders).toBeDefined();
    expect(typeof classConfig.exporter.getExportHeaders).toBe('function');
  });

  it('should return correct export headers', () => {
    const headers = classConfig.exporter.getExportHeaders([]);
    expect(headers).toEqual([
      { value: 'key', label: 'מפתח' },
      { value: 'name', label: 'שם' },
      { value: 'gradeLevel', label: 'רמת כיתה' },
    ]);
  });
});