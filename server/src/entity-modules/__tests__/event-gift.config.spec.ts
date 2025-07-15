import eventGiftConfig from '../event-gift.config';
import { EventGift } from 'src/db/entities/EventGift.entity';

describe('event-gift.config', () => {
  it('should export a valid config object', () => {
    expect(eventGiftConfig).toBeDefined();
    expect(eventGiftConfig.entity).toBe(EventGift);
  });

  it('should have correct query configuration', () => {
    expect(eventGiftConfig.query).toBeDefined();
    expect(eventGiftConfig.query.join).toEqual({
      event: { eager: false },
      gift: { eager: true },
    });
  });

  it('should have exporter configuration', () => {
    expect(eventGiftConfig.exporter).toBeDefined();
    expect(eventGiftConfig.exporter.getExportHeaders).toBeDefined();
    expect(typeof eventGiftConfig.exporter.getExportHeaders).toBe('function');
  });

  it('should return correct export headers', () => {
    const headers = eventGiftConfig.exporter.getExportHeaders([]);
    expect(headers).toEqual([
      { value: 'event.name', label: 'אירוע' },
      { value: 'gift.name', label: 'מתנה' },
      { value: 'year', label: 'שנה' },
    ]);
  });
});