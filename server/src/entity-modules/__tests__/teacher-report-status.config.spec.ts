import { Test } from '@nestjs/testing';
import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { TeacherReportStatus } from 'src/db/view-entities/TeacherReportStatus.entity';
import { DataSource } from 'typeorm';
import { MailSendService } from '@shared/utils/mail/mail-send.service';
import teacherReportFile from 'src/reports/teacherReportFile';
import * as reportGenerator from 'src/reports/reportGenerator';
import config from '../teacher-report-status.config';
import { CrudRequest } from '@dataui/crud';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';

type ParsedRequestType = {
  fields: any[];
  paramsFilter: any[];
  authPersist: any;
  search: any;
  filter: any[];
  or: any[];
  join: any[];
  sort: any[];
  limit: number;
  offset: number;
  page: number;
  cache: number;
  includeDeleted: boolean;
  classTransformOptions: Record<string, any>;
};

interface MockRequest extends Omit<CrudRequest, 'parsed'> {
  parsed: Partial<ParsedRequestType> & {
    extra: {
      report?: string;
      action?: string;
      isGrades?: boolean;
    };
    classTransformOptions?: Record<string, any>;
  };
  options: Record<string, any>;
}

interface ReportData {
  generator: any;
  params: Record<string, any>;
}

interface ActionResult {
  success?: boolean;
  someData?: string;
  someOtherData?: string;
}

jest.mock('src/reports/reportGenerator', () => ({
  getTeacherStatusFileReportParams: jest.fn(),
  sendTeacherReportFileMail: jest.fn()
}));

describe('teacher-report-status.config', () => {
  describe('getConfig', () => {
    it('should return TeacherReportStatus entity and export headers configuration', () => {
      expect(config.entity).toBe(TeacherReportStatus);
      
      const headers = config.exporter.getExportHeaders([]);
      expect(headers).toHaveLength(4);
      expect(headers).toEqual([
        { value: 'teacherName', label: 'מורה' },
        { value: 'reportMonthName', label: 'תקופת דיווח' },
        { value: 'reportedLessonNames', label: 'שיעורים שדווחו' },
        { value: 'notReportedLessonNames', label: 'שיעורים שלא דווחו' }
      ]);
    });
  });

  describe('TeacherReportStatusService', () => {
    let service: InstanceType<typeof config.service>;
    let mockDataSource: DataSource;
    let mockMailSendService: jest.Mocked<MailSendService>;

    beforeEach(async () => {
      const mockRepository = {
        target: TeacherReportStatus,
        manager: {
          transaction: jest.fn()
        },
        metadata: {
          columns: [
            { propertyName: 'id' },
            { propertyName: 'name' },
            { propertyName: 'userId' }
          ],
          connection: { options: { type: 'mysql' } },
          targetName: 'TestEntity'
        },
        createQueryBuilder: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
        save: jest.fn().mockImplementation(entity => Promise.resolve(entity))
      } as any;
  
      mockDataSource = {
        createQueryRunner: jest.fn(),
        getRepository: jest.fn().mockReturnValue(mockRepository)
      } as any as DataSource;

      mockMailSendService = {
        mailerService: {
          sendMail: jest.fn()
        }
      } as unknown as jest.Mocked<MailSendService>;

      service = new config.service(mockRepository, mockMailSendService);
      service.dataSource = mockDataSource;
    });

    describe('getReportData', () => {
      it('should handle teacherReportFile report type', async () => {
        const mockParams = { someParam: 'value' } as any;
        const getTeacherStatusFileReportParams = jest.spyOn(reportGenerator, 'getTeacherStatusFileReportParams');
        getTeacherStatusFileReportParams.mockReturnValue(mockParams);

        const req: MockRequest = {
          parsed: {
            extra: {
              report: 'teacherReportFile'
            },
            fields: [],
            paramsFilter: [],
            filter: [],
            or: [],
            join: [],
            sort: [],
            classTransformOptions: {}
          },
          options: {}
        };

        const result = await service.getReportData(req as unknown as CrudRequest);

        expect(req.parsed.extra.isGrades).toBe(false);
        expect(result).toEqual({
          generator: service['reportsDict'].teacherReportFile,
          params: mockParams
        });
        expect(getTeacherStatusFileReportParams).toHaveBeenCalledWith(req);
      });

      it('should fall back to parent getReportData for unknown report type', async () => {
        const req: MockRequest = {
          parsed: {
            extra: {
              report: 'unknownReport'
            },
            fields: [],
            paramsFilter: [],
            filter: [],
            or: [],
            join: [],
            sort: [],
            classTransformOptions: {}
          },
          options: {}
        };

        const mockParentResult: ReportData = { 
          generator: null,
          params: { someData: 'value' }
        };
        
        const parentGetReportData =jest.spyOn(BaseEntityService.prototype, 'getReportData')
          .mockResolvedValue(mockParentResult);

        const result = await service.getReportData(req as unknown as CrudRequest);

        expect(result).toEqual(mockParentResult);
        expect(parentGetReportData).toHaveBeenCalledWith(req);
      });
    });

    describe('doAction', () => {
      it('should handle teacherReportFile action', async () => {
        const mockResult = 'mockResult';
        const sendTeacherReportFileMail = jest.spyOn(reportGenerator, 'sendTeacherReportFileMail');
        sendTeacherReportFileMail.mockResolvedValue(mockResult);

        const req: MockRequest = {
          parsed: {
            extra: {
              action: 'teacherReportFile'
            },
            fields: [],
            paramsFilter: [],
            filter: [],
            or: [],
            join: [],
            sort: [],
            classTransformOptions: {}
          },
          options: {}
        };
        const body: Record<string, unknown> = { someData: 'value' };

        const result = await service.doAction(req as unknown as CrudRequest, body);

        expect(req.parsed.extra.isGrades).toBe(false);
        expect(result).toEqual(mockResult);
        expect(sendTeacherReportFileMail).toHaveBeenCalledWith(
          req,
          mockDataSource,
          mockMailSendService
        );
      });

      it('should fall back to parent doAction for unknown action', async () => {
        const req: MockRequest = {
          parsed: {
            extra: {
              action: 'unknownAction'
            },
            fields: [],
            paramsFilter: [],
            filter: [],
            or: [],
            join: [],
            sort: [],
            classTransformOptions: {}
          },
          options: {}
        };
        const body: Record<string, unknown> = { someData: 'value' };
        const mockParentResult: ActionResult = { someOtherData: 'value' };
        
        const parentDoAction = jest.spyOn(BaseEntityService.prototype, 'doAction')
          .mockImplementation(() => Promise.resolve(mockParentResult));

          const result = await service.doAction(req as unknown as CrudRequest, body);

        expect(result).toEqual(mockParentResult);
        expect(parentDoAction).toHaveBeenCalledWith(req, body);
      });
    });
  });
});