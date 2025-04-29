import config, { calcAttLateCount } from '../att-report.config';
import { AttReport } from 'src/db/entities/AttReport.entity';
import { User } from '@shared/entities/User.entity';

describe('att-report.config', () => {
  describe('getConfig', () => {
    it('should return config with proper entity and query settings', () => {
      expect(config.entity).toBe(AttReport);
      expect(config.query).toBeDefined();
      expect(config.query.join).toEqual({
        studentBaseKlass: { eager: true },
        student: {},
        teacher: {},
        lesson: {},
        klass: {},
      });
    });

    it('should have proper export configuration', () => {
      expect(config.exporter).toBeDefined();
      
      // Test processReqForExport
      const mockReq = {
        options: {
          query: { join: {} }
        }
      };
      const mockInnerFunc = jest.fn(req => req);
      
      config.exporter.processReqForExport(mockReq as any, mockInnerFunc);
      
      expect(mockReq.options.query.join).toEqual({
        student: { eager: true },
        teacher: { eager: true },
        klass: { eager: true },
        lesson: { eager: true }
      });
      expect(mockInnerFunc).toHaveBeenCalledWith(mockReq);

      // Test getExportHeaders
      const headers = config.exporter.getExportHeaders(['id', 'name', 'absCount']);
      expect(headers).toHaveLength(9); // Verify number of headers
      expect(headers[0]).toEqual({ value: 'id', label: 'מזהה' });
    });

    it('should have proper import configuration', () => {
      const importConfig = config.exporter.getImportDefinition(['test']);
      
      expect(importConfig.importFields).toHaveLength(6);
      expect(importConfig.specialFields).toHaveLength(4);
      expect(importConfig.hardCodedFields).toHaveLength(1);
      expect(importConfig.beforeSave).toBe(calcAttLateCount);
    });
  });

  describe('calcAttLateCount', () => {
    it('should calculate absCount with lateCount and default lateValue', () => {
      const report = {
        absCount: 2,
        lateCount: 3
      } as AttReport & { lateCount: number };
      
      const user = {
        additionalData: {}
      } as User;

      calcAttLateCount(report, user);
      
      // With default lateValue of 0.3: 2 + (3 * 0.3) = 2.9
      expect(report.absCount).toBe(2.9);
      expect(report.lateCount).toBeUndefined();
    });

    it('should use custom lateValue from user data', () => {
      const report = {
        absCount: 2,
        lateCount: 2
      } as AttReport & { lateCount: number };
      
      const user = {
        additionalData: { lateValue: 0.5 }
      } as User;

      calcAttLateCount(report, user);
      
      // With lateValue of 0.5: 2 + (2 * 0.5) = 3
      expect(report.absCount).toBe(3);
    });

    it('should handle NaN values', () => {
      const report = {
        absCount: NaN,
        lateCount: NaN
      } as AttReport & { lateCount: number };
      
      const user = {
        additionalData: { lateValue: 0.5 }
      } as User;

      calcAttLateCount(report, user);
      
      expect(report.absCount).toBe(0);
    });
  });
});