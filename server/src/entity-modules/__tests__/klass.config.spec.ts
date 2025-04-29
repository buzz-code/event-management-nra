import { CrudRequest } from '@dataui/crud';
import { Klass } from 'src/db/entities/Klass.entity';
import klassConfig from '../klass.config';

describe('KlassConfig', () => {
  it('should have correct base configuration', () => {
    expect(klassConfig.entity).toBe(Klass);
    expect(klassConfig.query).toBeDefined();
    expect(klassConfig.query.join).toEqual(expect.objectContaining({
      teacher: {},
      klassType: {},
    }));
  });

  it('should have correct exporter configuration', () => {
    expect(klassConfig.exporter).toBeDefined();
    expect(typeof klassConfig.exporter.processReqForExport).toBe('function');
    expect(typeof klassConfig.exporter.getExportHeaders).toBe('function');
  });

  it('should process request for export correctly', () => {
    const mockRequest = {
      options: {
        query: {
          join: {},
        },
      },
    } as CrudRequest;

    const mockInnerFunc = jest.fn(req => req);

    const result = klassConfig.exporter.processReqForExport(mockRequest, mockInnerFunc);

    expect(mockInnerFunc).toHaveBeenCalledWith(mockRequest);
    expect(mockRequest.options.query.join).toEqual(expect.objectContaining({
      klassType: { eager: true },
      teacher: { eager: true },
    }));
    expect(result).toBe(mockRequest);
  });

  it('should return correct export headers', () => {
    const fields = ['key', 'name', 'klassType.name', 'teacher.name'];
    const headers = klassConfig.exporter.getExportHeaders(fields);

    expect(headers).toEqual(expect.arrayContaining([
      { value: 'key', label: 'מזהה' },
      { value: 'name', label: 'שם' },
      { value: 'teacher.name', label: 'מורה' },
    ]));
  });
});