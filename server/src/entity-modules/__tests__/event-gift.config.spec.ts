import eventGiftConfig from '../event-gift.config';
import { EventGift } from 'src/db/entities/EventGift.entity';

describe('EventGiftConfig', () => {
  it('should use EventGift entity', () => {
    expect(eventGiftConfig.entity).toBe(EventGift);
  });

  it('should have correct query configuration', () => {
    expect(eventGiftConfig.query).toBeDefined();
    expect(eventGiftConfig.query.join).toBeDefined();
    expect(eventGiftConfig.query.join.event).toEqual({ eager: false });
    expect(eventGiftConfig.query.join.gift).toEqual({ eager: true });
  });

  it('should have exporter with getExportHeaders function', () => {
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