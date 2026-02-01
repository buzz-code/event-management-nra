import { createAuditLogConfig } from '@shared/entities/configs/audit-log.config';
import { AuditLog } from '@shared/entities/AuditLog.entity';
import { IColumn } from '@shared/utils/exporter/types';
import { Student } from 'src/db/entities/Student.entity';
import { Connection, Repository } from 'typeorm';

describe('audit-log.config', () => {
  const config = createAuditLogConfig({
    student: Student,
  });

  describe('getConfig', () => {
    it('should return config with proper entity', () => {
      expect(config.entity).toBe(AuditLog);
    });

    it('should have export configuration with proper headers', () => {
      const headers = config.exporter.getExportHeaders(['id']);
      // First check all regular headers
      expect(headers).toHaveLength(6);
      expect(headers[0] as IColumn).toEqual({
        value: 'userId',
        label: 'משתמש',
      });
      expect(headers[1] as IColumn).toEqual({
        value: 'entityId',
        label: 'מזהה שורה',
      });
      expect(headers[2] as IColumn).toEqual({
        value: 'entityName',
        label: 'טבלה',
      });
      expect(headers[3] as IColumn).toEqual({
        value: 'operation',
        label: 'פעולה',
      });
      expect(headers[5] as IColumn).toEqual({
        value: 'createdAt',
        label: 'תאריך יצירה',
      });

      const formatterHeader = headers[4] as IColumn;
      expect(formatterHeader.label).toBe('המידע שהשתנה');
      const value = formatterHeader.value as (record: any) => string;
      const formatterResult = value({ entityData: { test: 123 } });
      expect(formatterResult).toBe('{"test":123}');
    });
  });

  describe('AuditLogService', () => {
    let service;
    let mockRepo: any;
    let mockStudentRepo: any;
    let mockDataSource: any;
    let mockMailService: any;

    beforeEach(() => {
      const mockConnection = {
        options: {},
        createQueryBuilder: jest.fn(),
      } as unknown as Connection;

      mockRepo = {
        findBy: jest.fn(),
        update: jest.fn(),
        target: AuditLog,
        manager: {
          connection: mockConnection,
        },
        metadata: {
          columns: [],
          relations: [],
          connection: mockConnection,
        },
      } as unknown as Repository<AuditLog>;

      mockStudentRepo = {
        insert: jest.fn(),
      };

      mockDataSource = {
        getRepository: jest.fn().mockReturnValue(mockStudentRepo),
      };

      mockMailService = {
        sendMail: jest.fn(),
      };

      const ServiceClass = config.service;
      service = new ServiceClass(mockRepo, mockMailService);
      service.dataSource = mockDataSource;
    });

    it('should handle revert action successfully for DELETE operation', async () => {
      const auditLogs = [
        {
          id: 1,
          entityId: 100,
          entityName: 'student',
          operation: 'DELETE',
          entityData: { name: 'Test Student' },
          isReverted: false,
        },
      ];

      mockRepo.findBy.mockResolvedValue(auditLogs);
      mockRepo.update.mockResolvedValue({ affected: 1 });
      mockStudentRepo.insert.mockResolvedValue({});

      const req = {
        parsed: {
          extra: {
            action: 'revert',
            ids: '1',
          },
        },
      };

      const result = await service.doAction(req, {});
      expect(result).toBe('reverted 1 items');
      expect(mockStudentRepo.insert).toHaveBeenCalledWith({
        name: 'Test Student',
        id: 100,
      });
    });
  });
});
