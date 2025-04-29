import { CrudRequest } from '@dataui/crud';
import { DataSource, In, Repository, DeepPartial } from 'typeorm';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import { BulkToPdfReportGenerator } from '@shared/utils/report/bulk-to-pdf.generator';
import { MailerService } from '@nestjs-modules/mailer';
import { MailSendService } from '@shared/utils/mail/mail-send.service';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { CommonReportData } from '@shared/utils/report/types';
import { ParamsToJsonReportGenerator } from '@shared/utils/report/params-to-json.generator';
import config from '../student-klass.config';

jest.mock('@shared/utils/report/bulk-to-pdf.generator');
jest.mock('src/reports/reportGenerator');
jest.mock('@shared/base-entity/base-entity.service');

const createMockCrudRequest = (extra: any): CrudRequest => ({
  parsed: {
    fields: [],
    paramsFilter: [],
    authPersist: undefined,
    classTransformOptions: undefined,
    search: undefined,
    filter: [],
    or: [],
    join: [],
    sort: [],
    limit: undefined,
    offset: undefined,
    page: undefined,
    cache: undefined,
    includeDeleted: undefined,
    extra,
  },
  options: {
    query: {
      join: {},
    },
    routes: {
      getManyBase: { interceptors: [], decorators: [] },
      getOneBase: { interceptors: [], decorators: [] },
      createOneBase: { interceptors: [], decorators: [] },
      createManyBase: { interceptors: [], decorators: [] },
      updateOneBase: { interceptors: [], decorators: [] },
      replaceOneBase: { interceptors: [], decorators: [] },
      deleteOneBase: { interceptors: [], decorators: [] },
    },
    params: {},
  },
}) as CrudRequest;

const createMockStudentKlass = (data: Partial<StudentKlass> = {}): StudentKlass => ({
  id: 1,
  userId: 1,
  year: 2023,
  studentTz: '123456789',
  studentReferenceId: 1,
  klassId: 1,
  klassReferenceId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  student: null,
  klass: null,
  fillFields: jest.fn(),
  ...data,
});

describe('StudentKlassConfig', () => {
  describe('getConfig', () => {
    it('should return correct entity config', () => {
      expect(config.entity).toBe(StudentKlass);
      expect(config.query.join).toEqual({
        student: {},
        klass: {},
      });
    });

    it('should process request for export correctly', () => {
      const req = {
        options: {
          query: {
            join: {},
          },
        },
      } as CrudRequest;
      const innerFunc = jest.fn();

      config.exporter?.processReqForExport(req, innerFunc);

      expect(req.options.query.join).toEqual({
        student: { eager: true },
        klass: { eager: true },
      });
      expect(innerFunc).toHaveBeenCalledWith(req);
    });

    it('should return correct export headers', () => {
      const headers = config.exporter?.getExportHeaders([]) ?? [];
      expect(headers).toHaveLength(2);
      expect(headers).toEqual([
        { value: 'student.name', label: 'שם התלמידה' },
        { value: 'klass.name', label: 'כיתה' },
      ]);
    });
  });

  describe('StudentKlassService', () => {
    let service: any;
    let mockDataSource: Partial<DataSource>;
    let mockRepository: jest.Mocked<Partial<Repository<StudentKlass>>>;
    let mockMailService: MailSendService;
    let mockBaseEntityGetReportData: jest.SpyInstance;
    let mockBaseEntityDoAction: jest.SpyInstance;

    beforeEach(() => {
      mockRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        findBy: jest.fn(),
        create: jest.fn(),
        metadata: {
          connection: {},
          columns: [],
          relations: [],
          subscribers: [],
          entityRepository: {} as any,
          target: StudentKlass,
          expression: undefined,
          tableType: undefined,
          orderBy: undefined,
          discriminatorValue: undefined,
          name: 'student_klasses',
        } as any,
      };

      // Mock save method to handle both single entities and arrays
      mockRepository.save = jest.fn().mockImplementation((entity: any) => {
        if (Array.isArray(entity)) {
          return Promise.resolve(entity.map(e => ({ ...e })));
        }
        return Promise.resolve({ ...entity });
      });

      mockDataSource = {
        getRepository: jest.fn().mockReturnValue(mockRepository),
      };

      const mockMailerService: Partial<MailerService> = {
        sendMail: jest.fn(),
      };

      mockMailService = new MailSendService(mockMailerService as MailerService);

      const mockReportData: CommonReportData = {
        generator: new ParamsToJsonReportGenerator(() => 'test'),
        params: {},
      };

      mockBaseEntityGetReportData = jest.spyOn(BaseEntityService.prototype, 'getReportData')
        .mockImplementation(() => Promise.resolve(mockReportData));
      mockBaseEntityDoAction = jest.spyOn(BaseEntityService.prototype, 'doAction')
        .mockImplementation(() => Promise.resolve({}));

      const Service = config.service;
      service = new Service(mockRepository as Repository<StudentKlass>, mockMailService);
      service.dataSource = mockDataSource as DataSource;
    });

    describe('getReportData', () => {
      it('should handle studentReportCard report type', async () => {
        const req = {
          ...createMockCrudRequest({
            report: 'studentReportCard',
            ids: '1,2,3',
          }),
          auth: { id: 1 },
        };

        mockRepository.find.mockResolvedValueOnce([
          createMockStudentKlass({ studentReferenceId: 101 }),
          createMockStudentKlass({ studentReferenceId: 102 }),
          createMockStudentKlass({ studentReferenceId: 103 }),
        ]);

        await service.getReportData(req);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: { id: In(['1', '2', '3']) },
          select: { studentReferenceId: true },
        });
      });

      it('should handle studentReportCardReact report type', async () => {
        const req = {
          ...createMockCrudRequest({
            report: 'studentReportCardReact',
            ids: '1,2',
          }),
          auth: { id: 1 },
        };

        mockRepository.find.mockResolvedValueOnce([
          createMockStudentKlass({ studentReferenceId: 101 }),
          createMockStudentKlass({ studentReferenceId: 102 }),
        ]);

        await service.getReportData(req);

        expect(mockRepository.find).toHaveBeenCalledWith({
          where: { id: In(['1', '2']) },
          select: { studentReferenceId: true },
        });
      });

      it('should call super.getReportData for unknown report type', async () => {
        const req = createMockCrudRequest({
          report: 'unknownReport',
        });

        await service.getReportData(req);
        expect(mockBaseEntityGetReportData).toHaveBeenCalledWith(req);
      });
    });

    describe('doAction', () => {
      it('should handle fixReferences action', async () => {
        const req = createMockCrudRequest({
          action: 'fixReferences',
          ids: '1,2,3',
        });

        const mockEntities = [
          createMockStudentKlass({ id: 1, studentTz: '123', klassId: 1 }),
          createMockStudentKlass({ id: 2, studentTz: '456', klassId: 2 }),
          createMockStudentKlass({ id: 3, studentTz: '789', klassId: 3 }),
        ];

        mockRepository.findBy.mockResolvedValueOnce(mockEntities);

        await service.doAction(req, {});

        expect(mockRepository.findBy).toHaveBeenCalledWith({ id: In(['1', '2', '3']) });
        expect(mockRepository.save).toHaveBeenCalled();
      });

      it('should call super.doAction for unknown action', async () => {
        const req = createMockCrudRequest({
          action: 'unknownAction',
        });

        await service.doAction(req, {});
        expect(mockBaseEntityDoAction).toHaveBeenCalledWith(req, {});
      });
    });
  });
});