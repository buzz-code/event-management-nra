import giftConfig from '../gift.config';
import { Gift } from 'src/db/entities/Gift.entity';

describe('GiftConfig', () => {
  it('should use Gift entity', () => {
    expect(giftConfig.entity).toBe(Gift);
  });

  it('should have exporter with getExportHeaders function', () => {
    expect(giftConfig.exporter).toBeDefined();
    expect(giftConfig.exporter.getExportHeaders).toBeDefined();
    expect(typeof giftConfig.exporter.getExportHeaders).toBe('function');
  });

  it('should return correct export headers', () => {
    const headers = giftConfig.exporter.getExportHeaders([]);
    
    expect(headers).toEqual([
      { value: 'key', label: 'מפתח' },
      { value: 'name', label: 'שם' },
      { value: 'description', label: 'תיאור' },
      { value: 'year', label: 'שנה' },
    ]);
  });
});