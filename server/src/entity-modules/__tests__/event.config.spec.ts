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

  it('should process dynamic value functions in export headers', () => {
    const headers = eventConfig.exporter.getExportHeaders([]);
    
    // Find the notes header by checking the structure 
    const notesHeader = headers.find(h => (h as any).label === 'הערות');
    expect(notesHeader).toBeDefined();
    expect(typeof (notesHeader as any).value).toBe('function');
    
    // Test the notes function
    const mockRow = {
      notes: [
        { noteText: 'הערה 1' },
        { noteText: 'הערה 2' }
      ]
    };
    const result = ((notesHeader as any).value as Function)(mockRow);
    expect(result).toBe('הערה 1\r\nהערה 2');
    
    // Find the empty note header
    const emptyNoteHeader = headers.find(h => (h as any).label === 'הערה חדשה');
    expect(emptyNoteHeader).toBeDefined();
    expect(typeof (emptyNoteHeader as any).value).toBe('function');
    expect(((emptyNoteHeader as any).value as Function)({})).toBe('');
  });

  it('should have crudAuth configuration', () => {
    expect(eventConfig.crudAuth).toBeDefined();
    // crudAuth is a filter object, not a function
    expect(typeof eventConfig.crudAuth).toBe('object');
  });

  it('should have service class defined', () => {
    expect(eventConfig.service).toBeDefined();
  });
});
