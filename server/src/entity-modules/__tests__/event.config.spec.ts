import eventConfig from '../event.config';
import { Event } from 'src/db/entities/Event.entity';

describe('EventConfig', () => {
  it('should use Event entity', () => {
    expect(eventConfig.entity).toBe(Event);
  });

  it('should have correct export headers', () => {
    const headers = eventConfig.exporter.getExportHeaders([]);
    
    expect(headers).toContainEqual({ value: 'id', label: 'מזהה', readOnly: true });
    expect(headers).toContainEqual({ value: 'student.tz', label: 'תז תלמיד' });
    expect(headers).toContainEqual({ value: 'student.name', label: 'שם תלמידה', readOnly: true });
    expect(headers.length).toBeGreaterThan(0);
  });

  it('should have correct query configuration', () => {
    expect(eventConfig.query).toBeDefined();
    expect(eventConfig.query.join).toBeDefined();
    expect(eventConfig.query.join.eventType).toEqual({ eager: false });
    expect(eventConfig.query.join.teacher).toEqual({ eager: true });
    expect(eventConfig.query.join.student).toEqual({ eager: false });
  });

  it('should have exporter with processReqForExport function', () => {
    expect(eventConfig.exporter).toBeDefined();
    expect(eventConfig.exporter.processReqForExport).toBeDefined();
    expect(typeof eventConfig.exporter.processReqForExport).toBe('function');
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
    
    const result = eventConfig.exporter.processReqForExport(mockReq as any, mockInnerFunc);
    
    expect(mockReq.options.query.join).toEqual({
      eventType: { eager: true },
      teacher: { eager: true },
      student: { eager: true },
      studentClass: { eager: true },
      levelType: { eager: true },
      notes: { eager: true },
      eventGifts: { eager: true },
    });
    
    expect(mockInnerFunc).toHaveBeenCalledWith(mockReq);
    expect(result).toBe('result');
  });
});
