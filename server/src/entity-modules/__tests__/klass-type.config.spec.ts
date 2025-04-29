import { KlassType } from 'src/db/entities/KlassType.entity';
import klassTypeConfig from '../klass-type.config';

describe('KlassTypeConfig', () => {
  it('should use KlassType entity', () => {
    expect(klassTypeConfig.entity).toBe(KlassType);
  });

  it('should return correct export headers', () => {
    const fields = ['key', 'name'];
    const headers = klassTypeConfig.exporter.getExportHeaders(fields);
    
    expect(headers).toEqual(expect.arrayContaining([
      { value: 'key', label: 'מזהה' },
      { value: 'name', label: 'שם' },
    ]));
  });

  it('should return correct import definition', () => {
    const mockImportFields = ['field1', 'field2'];
    const result = klassTypeConfig.exporter.getImportDefinition(mockImportFields);

    // Check if splice was called correctly (adds empty string at index 1)
    expect(mockImportFields).toEqual(['field1', '', 'field2']);

    // Check the returned definition
    expect(result).toEqual({
      importFields: mockImportFields,
      specialFields: expect.arrayContaining([
        { cell: { c: 0, r: 1 }, value: 'test' }
      ])
    });
  });
});