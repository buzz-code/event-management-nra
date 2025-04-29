import config from '../audit-log.config';
import { AuditLog } from '@shared/entities/AuditLog.entity';
import { Student } from 'src/db/entities/Student.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { Connection, DataSource, Repository } from 'typeorm';
import { getJsonFormatter } from '@shared/utils/formatting/formatter.util';
import { IColumn } from '@shared/utils/exporter/types';

describe('audit-log.config', () => {
  describe('getConfig', () => {
    it('should return config with proper entity', () => {
      expect(config.entity).toBe(AuditLog);
    });

    it('should have export configuration with proper headers', () => {
      const headers = config.exporter.getExportHeaders(['id']);
      // First check all regular headers
      expect(headers).toHaveLength(6);
      expect(headers[0] as IColumn).toEqual({ value: 'userId', label: 'משתמש' });
      expect(headers[1] as IColumn).toEqual({ value: 'entityId', label: 'מזהה שורה' });
      expect(headers[2] as IColumn).toEqual({ value: 'entityName', label: 'טבלה' });
      expect(headers[3] as IColumn).toEqual({ value: 'operation', label: 'פעולה' });
      expect(headers[5] as IColumn).toEqual({ value: 'createdAt', label: 'תאריך יצירה' });

      // Check formatter header separately
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
      // Create mock connection
      const mockConnection = {
        options: {},
        createQueryBuilder: jest.fn()
      } as unknown as Connection;

      // Create mock repo with required TypeORM properties
      mockRepo = {
        findBy: jest.fn(),
        update: jest.fn(),
        target: AuditLog,
        manager: {
          connection: mockConnection
        },
        metadata: {
          columns: [],
          relations: [],
          connection: mockConnection
        }
      } as unknown as Repository<AuditLog>;

      mockStudentRepo = {
        insert: jest.fn()
      };

      mockDataSource = {
        getRepository: jest.fn().mockReturnValue(mockStudentRepo)
      };

      mockMailService = {
        sendMail: jest.fn()
      };

      const ServiceClass = config.service;
      service = new ServiceClass(mockRepo, mockMailService);
      service.dataSource = mockDataSource;
    });

    describe('doAction', () => {
      it('should handle revert action successfully for DELETE operation', async () => {
        const auditLogs = [
          {
            id: 1,
            entityId: 100,
            entityName: 'student',
            operation: 'DELETE',
            entityData: { name: 'Test Student' },
            isReverted: false
          }
        ];

        mockRepo.findBy.mockResolvedValue(auditLogs);
        mockRepo.update.mockResolvedValue({ affected: 1 });
        mockStudentRepo.insert.mockResolvedValue({});

        const req = {
          parsed: {
            extra: {
              action: 'revert',
              ids: '1'
            }
          }
        };

        const result = await service.doAction(req, {});
        expect(result).toBe('reverted 1 items');

        expect(mockRepo.findBy).toHaveBeenCalledWith({ id: expect.any(Object) });
        expect(mockStudentRepo.insert).toHaveBeenCalledWith({
          name: 'Test Student',
          id: 100
        });
        expect(mockRepo.update).toHaveBeenCalledWith(
          { id: 1 },
          { isReverted: true }
        );
      });

      it('should handle revert action with unknown operation', async () => {
        const auditLogs = [
          {
            id: 1,
            entityId: 100,
            entityName: 'student',
            operation: 'UNKNOWN',
            entityData: { name: 'Test Student' },
            isReverted: false
          }
        ];

        mockRepo.findBy.mockResolvedValue(auditLogs);
        console.log = jest.fn();

        const req = {
          parsed: {
            extra: {
              action: 'revert',
              ids: '1'
            }
          }
        };

        const result = await service.doAction(req, {});
        expect(result).toBe('reverted 0 items, failed 1 items');
        expect(console.log).toHaveBeenCalledWith(
          'AuditLogService.revert: error',
          expect.any(Error)
        );
      });

      it('should skip already reverted logs', async () => {
        const auditLogs = [
          {
            id: 1,
            entityId: 100,
            entityName: 'student',
            operation: 'DELETE',
            entityData: { name: 'Test Student' },
            isReverted: true
          }
        ];

        mockRepo.findBy.mockResolvedValue(auditLogs);

        const req = {
          parsed: {
            extra: {
              action: 'revert',
              ids: '1'
            }
          }
        };

        const result = await service.doAction(req, {});
        expect(result).toBe('reverted 1 items');
        expect(mockStudentRepo.insert).not.toHaveBeenCalled();
      });

      it('should skip unknown entity names', async () => {
        const auditLogs = [
          {
            id: 1,
            entityId: 100,
            entityName: 'unknown',
            operation: 'DELETE',
            entityData: { name: 'Test' },
            isReverted: false
          }
        ];

        mockRepo.findBy.mockResolvedValue(auditLogs);

        const req = {
          parsed: {
            extra: {
              action: 'revert',
              ids: '1'
            }
          }
        };

        const result = await service.doAction(req, {});
        expect(result).toBe('reverted 1 items');
        expect(mockStudentRepo.insert).not.toHaveBeenCalled();
      });

      it('should handle multiple audit logs', async () => {
        const auditLogs = [
          {
            id: 1,
            entityId: 100,
            entityName: 'student',
            operation: 'DELETE',
            entityData: { name: 'Student 1' },
            isReverted: false
          },
          {
            id: 2,
            entityId: 101,
            entityName: 'student',
            operation: 'DELETE',
            entityData: { name: 'Student 2' },
            isReverted: false
          }
        ];

        mockRepo.findBy.mockResolvedValue(auditLogs);
        mockRepo.update.mockResolvedValue({ affected: 1 });
        mockStudentRepo.insert.mockResolvedValue({});

        const req = {
          parsed: {
            extra: {
              action: 'revert',
              ids: '1,2'
            }
          }
        };

        const result = await service.doAction(req, {});
        expect(result).toBe('reverted 2 items');
        expect(mockStudentRepo.insert).toHaveBeenCalledTimes(2);
        expect(mockRepo.update).toHaveBeenCalledTimes(2);
      });
    });
  });
});