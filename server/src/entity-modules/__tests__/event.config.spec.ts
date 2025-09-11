import eventConfig from '../event.config';
import { Event } from 'src/db/entities/Event.entity';

describe('EventConfig', () => {
  it('should use Event entity', () => {
    expect(eventConfig.entity).toBe(Event);
  });

  it('should have correct query configuration', () => {
    expect(eventConfig.query).toBeDefined();
    expect(eventConfig.query.join).toBeDefined();
    expect(eventConfig.query.join.eventType).toEqual({ eager: false });
    expect(eventConfig.query.join.teacher).toEqual({ eager: true });
    expect(eventConfig.query.join.student).toEqual({ eager: false });
  });

  it('should have service configured', () => {
    expect(eventConfig.service).toBeDefined();
  });

  it('should have exporter with headers', () => {
    expect(eventConfig.exporter).toBeDefined();
    expect(eventConfig.exporter.getExportHeaders).toBeInstanceOf(Function);
    expect(eventConfig.exporter.processReqForExport).toBeInstanceOf(Function);
    
    // Test that headers are properly defined
    const mockEntityColumns = ['id', 'name', 'year'];
    const headers = eventConfig.exporter.getExportHeaders(mockEntityColumns);
    expect(Array.isArray(headers)).toBe(true);
    expect(headers.length).toBeGreaterThan(0);
    expect(headers[0]).toHaveProperty('value');
    expect(headers[0]).toHaveProperty('label');
  });
});
