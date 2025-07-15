import textConfig from '../text.config';
import { Text } from '@shared/entities/Text.entity';

describe('text.config', () => {
  it('should export a valid config object', () => {
    expect(textConfig).toBeDefined();
    expect(textConfig.entity).toBe(Text);
  });

  it('should have exporter configuration', () => {
    expect(textConfig.exporter).toBeDefined();
    expect(textConfig.exporter.getExportHeaders).toBeDefined();
    expect(typeof textConfig.exporter.getExportHeaders).toBe('function');
  });

  it('should return correct export headers', () => {
    const headers = textConfig.exporter.getExportHeaders([]);
    expect(headers).toEqual([
      { value: 'name', label: 'מזהה' },
      { value: 'description', label: 'תיאור' },
      { value: 'value', label: 'ערך' },
    ]);
  });
});