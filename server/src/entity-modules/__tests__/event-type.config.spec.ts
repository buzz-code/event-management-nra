import eventTypeConfig from '../event-type.config';
import { EventType } from 'src/db/entities/EventType.entity';

describe('EventTypeConfig', () => {
  it('should use EventType entity', () => {
    expect(eventTypeConfig.entity).toBe(EventType);
  });

  it('should have exporter with getExportHeaders function', () => {
    expect(eventTypeConfig.exporter).toBeDefined();
    expect(eventTypeConfig.exporter.getExportHeaders).toBeDefined();
    expect(typeof eventTypeConfig.exporter.getExportHeaders).toBe('function');
  });

  it('should return correct export headers', () => {
    const headers = eventTypeConfig.exporter.getExportHeaders([]);
    
    expect(headers).toEqual([
      { value: 'key', label: 'מפתח' },
      { value: 'name', label: 'שם' },
      { value: 'description', label: 'תיאור' },
      { value: 'year', label: 'שנה' },
    ]);
  });
});