import eventNoteConfig from '../event-note.config';
import { EventNote } from 'src/db/entities/EventNote.entity';

describe('event-note.config', () => {
  it('should export a valid config object', () => {
    expect(eventNoteConfig).toBeDefined();
    expect(eventNoteConfig.entity).toBe(EventNote);
  });

  it('should have correct query configuration', () => {
    expect(eventNoteConfig.query).toBeDefined();
    expect(eventNoteConfig.query.join).toEqual({
      event: { eager: false },
      author: { eager: false },
    });
  });

  it('should have exporter configuration', () => {
    expect(eventNoteConfig.exporter).toBeDefined();
    expect(eventNoteConfig.exporter.getExportHeaders).toBeDefined();
    expect(typeof eventNoteConfig.exporter.getExportHeaders).toBe('function');
  });

  it('should return correct export headers', () => {
    const headers = eventNoteConfig.exporter.getExportHeaders([]);
    expect(headers).toEqual([
      { value: 'event.name', label: 'אירוע' },
      { value: 'noteText', label: 'הערה' },
      { value: 'year', label: 'שנה' },
    ]);
  });
});