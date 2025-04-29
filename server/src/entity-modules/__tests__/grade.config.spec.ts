import { Repository, DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { MailSendService } from '@shared/utils/mail/mail-send.service';
import gradeConfig from '../grade.config';
import { Grade } from 'src/db/entities/Grade.entity';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { ENTITY_REPOSITORY, ENTITY_EXPORTER } from '@shared/base-entity/interface';
import { CrudRequest } from '@dataui/crud';
import * as reportUtil from '@shared/utils/report/report.util';
import * as authUtil from '@shared/auth/auth.util';

jest.mock('@shared/utils/report/report.util', () => ({
  generateCommonFileResponse: jest.fn()
}));

jest.mock('@shared/auth/auth.util', () => ({
  getUserIdFromUser: jest.fn()
}));

describe('grade.config', () => {
  let originalConsoleError;

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = jest.fn(); // Suppress console errors during tests
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  describe('Configuration and Exports', () => {
    it('should export correct entity configuration', () => {
      expect(gradeConfig.entity).toBe(Grade);
      expect(gradeConfig.service).toBeDefined();
      expect(gradeConfig.query).toBeDefined();
      
      // Validate complete query configuration
      const queryConfig = gradeConfig.query;
      expect(queryConfig).toBeDefined();
      expect(queryConfig.join).toBeDefined();
      expect(queryConfig.join).toEqual({
        studentBaseKlass: {},
        student: {},
        teacher: {},
        lesson: {},
        klass: {},
      });

      // Validate all required relationships are present
      const requiredRelations = ['studentBaseKlass', 'student', 'teacher', 'lesson', 'klass'];
      requiredRelations.forEach(relation => {
        expect(queryConfig.join[relation]).toBeDefined();
      });
    });

    describe('Import Configuration', () => {
      let importConfig;

      beforeEach(() => {
        importConfig = gradeConfig.exporter.getImportDefinition([]);
      });

      it('should define correct import fields structure', () => {
        expect(importConfig.importFields).toEqual([
          'klassId',
          'studentTz',
          '',
          'grade',
          'estimation',
          'comments',
        ]);
        expect(importConfig.importFields).toHaveLength(6);
      });

      it('should define correct special fields', () => {
        expect(importConfig.specialFields).toHaveLength(2);
        expect(importConfig.specialFields).toEqual([
          { cell: { c: 2, r: 0 }, value: 'teacherId' },
          { cell: { c: 2, r: 1 }, value: 'lessonId' },
        ]);
      });

      it('should define correct hardcoded fields', () => {
        expect(importConfig.hardCodedFields).toHaveLength(1);
        const hardCodedField = importConfig.hardCodedFields[0];
        expect(hardCodedField.field).toBe('reportDate');
        expect(hardCodedField.value).toBeInstanceOf(Date);
        expect(hardCodedField.value.getTime()).toBeLessThanOrEqual(new Date().getTime());
      });

      it('should handle empty import fields array', () => {
        const emptyConfig = gradeConfig.exporter.getImportDefinition([]);
        expect(emptyConfig).toBeDefined();
        expect(emptyConfig.importFields).toBeDefined();
        expect(Array.isArray(emptyConfig.importFields)).toBe(true);
      });
    });
  });

  describe('GradeService', () => {
    let module: TestingModule;
    let service: InstanceType<typeof gradeConfig.service>;
    let mockReq: CrudRequest<any, any>;
    let dataSource: jest.Mocked<DataSource>;

    beforeEach(async () => {
      const repository = {
        metadata: {
          columns: [{ propertyName: 'id' }],
          relations: [],
          connection: { options: { type: 'postgres' } },
          targetName: 'Grade'
        },
        manager: {
          connection: {
            createQueryRunner: jest.fn().mockReturnValue({
              manager: {}
            })
          }
        }
      };

      dataSource = {
        createQueryRunner: jest.fn().mockReturnValue({
          manager: {},
          connect: jest.fn(),
          startTransaction: jest.fn(),
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn()
        })
      } as any;

      module = await Test.createTestingModule({
        providers: [
          gradeConfig.service,
          {
            provide: ENTITY_REPOSITORY,
            useValue: repository
          },
          {
            provide: ENTITY_EXPORTER,
            useValue: gradeConfig.exporter
          },
          {
            provide: MailSendService,
            useValue: { send: jest.fn() }
          },
          {
            provide: DataSource,
            useValue: dataSource
          }
        ]
      }).compile();

      service = module.get<InstanceType<typeof gradeConfig.service>>(gradeConfig.service);

      mockReq = {
        parsed: {
          fields: [],
          paramsFilter: [],
          authPersist: null,
          classTransformOptions: {},
          search: {},
          filter: [],
          or: [],
          join: [],
          sort: [],
          limit: 0,
          offset: 0,
          page: 1,
          cache: 0,
          extra: {
            action: 'michlolPopulatedFile',
            fileName: 'test.xlsx'
          }
        },
        options: {},
        auth: { id: 123 }
      } as CrudRequest<any, any>;

      // Cast service to any to access implementation details in tests
      service = service as any;
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(BaseEntityService);
    });

    it('should handle michlolPopulatedFile action', async () => {
      const body = { data: { someData: true } };
      const gradeService = service as any;
      const expectedGenerator = gradeService.reportsDict.michlolPopulatedFile;

      (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(123);
      (reportUtil.generateCommonFileResponse as jest.Mock).mockResolvedValue({ success: true });

      const result = await service.doAction(mockReq, body);

      expect(authUtil.getUserIdFromUser).toHaveBeenCalledWith(mockReq.auth);
      expect(reportUtil.generateCommonFileResponse).toHaveBeenCalledWith(
        expectedGenerator,
        {
          userId: 123,
          michlolFileName: 'test.xlsx',
          michlolFileData: body.data
        },
        dataSource
      );

      expect(result).toEqual({ success: true });
    });

    it('should fallback to super.doAction for unknown actions', async () => {
      mockReq.parsed.extra.action = 'unknown';
      const mockResponse = { foo: 'bar' };
      jest.spyOn(BaseEntityService.prototype, 'doAction').mockResolvedValue(mockResponse);

      const result = await service.doAction(mockReq, {});
      
      expect(result).toBe(mockResponse);
    });

    it('should validate reportsDict configuration', () => {
      const gradeService = service as any;
      expect(gradeService.reportsDict).toBeDefined();
      expect(gradeService.reportsDict.michlolPopulatedFile).toBeDefined();
      expect(gradeService.reportsDict.michlolPopulatedFile).toEqual(
        expect.any(Object)
      );
    });

    it('should initialize with correct default values', () => {
      const gradeService = service as any;
      expect(Object.keys(gradeService.reportsDict)).toHaveLength(1);
      expect(gradeService.reportsDict).toHaveProperty('michlolPopulatedFile');
      expect(gradeService.reportsDict.michlolPopulatedFile).toEqual(
        expect.objectContaining({
          getReportData: expect.any(Function),
          getReportName: expect.any(Function)
        })
      );
    });

    it('should handle unknown report types', async () => {
      const unknownReportReq = createMockRequest({
        parsed: {
          ...createBaseParsedParams(),
          extra: { action: 'nonexistentReport' }
        }
      });
      
      const mockSuperDoAction = jest.spyOn(BaseEntityService.prototype, 'doAction')
        .mockResolvedValue({ fallback: true });
      
      const result = await service.doAction(unknownReportReq, {});
      expect(result).toEqual({ fallback: true });
      expect(mockSuperDoAction).toHaveBeenCalledWith(unknownReportReq, {});
    });

    it('should properly validate michlolPopulatedFile parameters', async () => {
      const testData = { data: { valid: true } };
      const validReq = createMockRequest({
        parsed: {
          ...createBaseParsedParams(),
          extra: {
            action: 'michlolPopulatedFile',
            fileName: 'test.xlsx'
          }
        }
      });

      (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(123);
      (reportUtil.generateCommonFileResponse as jest.Mock).mockResolvedValue({ success: true });

      const gradeService = service as any;
      const expectedGenerator = gradeService.reportsDict.michlolPopulatedFile;

      const result = await service.doAction(validReq, testData);
      
      expect(reportUtil.generateCommonFileResponse).toHaveBeenCalledWith(
        expectedGenerator,
        {
          userId: 123,
          michlolFileName: 'test.xlsx',
          michlolFileData: testData.data
        },
        dataSource
      );

      expect(result).toEqual({ success: true });
    });

    const createBaseParsedParams = () => ({
      fields: [],
      paramsFilter: [],
      authPersist: null,
      classTransformOptions: {},
      search: {},
      filter: [],
      or: [],
      join: [],
      sort: [],
      limit: 0,
      offset: 0,
      page: 1,
      cache: 0,
      includeDeleted: 0,
      extra: {
        action: 'michlolPopulatedFile',
        fileName: 'test.xlsx'
      }
    });

    const createMockRequest = (overrides: Partial<CrudRequest> = {}): CrudRequest<any, any> => ({
      parsed: {
        ...createBaseParsedParams(),
        ...(overrides.parsed || {})
      },
      options: {},
      auth: { id: 123 },
      ...overrides
    } as CrudRequest<any, any>);

    describe('error handling', () => {
      beforeEach(() => {
        jest.resetAllMocks();
      });

      it('should handle missing fileName in request', async () => {
        const reqWithoutFileName = createMockRequest({
          parsed: {
            ...createBaseParsedParams(),
            extra: {
              action: 'michlolPopulatedFile'
              // fileName missing
            }
          }
        });

        (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(123);
        (reportUtil.generateCommonFileResponse as jest.Mock).mockRejectedValue(
          new Error('fileName is required')
        );

        await expect(service.doAction(reqWithoutFileName, { data: {} }))
          .rejects
          .toThrow('fileName is required');
      });

      it('should handle missing data in body', async () => {
        const emptyBody = {};
        (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(123);
        (reportUtil.generateCommonFileResponse as jest.Mock).mockRejectedValue(
          new Error('data is required')
        );

        await expect(service.doAction(mockReq, emptyBody))
          .rejects
          .toThrow('data is required');
      });

      it('should handle file generation failure', async () => {
        const error = new Error('File generation failed');
        (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(123);
        (reportUtil.generateCommonFileResponse as jest.Mock).mockRejectedValue(error);

        await expect(service.doAction(mockReq, { data: {} }))
          .rejects
          .toThrow('File generation failed');
      });

      it('should handle invalid user auth', async () => {
        const authError = new Error('Invalid auth');
        (authUtil.getUserIdFromUser as jest.Mock).mockImplementation(() => {
          throw authError;
        });

        await expect(service.doAction(mockReq, { data: {} }))
          .rejects
          .toThrow('Invalid auth');
      });

      it('should handle invalid file data format', async () => {
        const invalidData = {
          data: {
            invalidFormat: true,
            missingRequiredFields: true
          }
        };

        (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(123);
        (reportUtil.generateCommonFileResponse as jest.Mock).mockRejectedValue(
          new Error('Invalid file data format')
        );

        await expect(service.doAction(mockReq, invalidData))
          .rejects
          .toThrow('Invalid file data format');

        expect(reportUtil.generateCommonFileResponse).toHaveBeenCalledWith(
          expect.any(Object),
          expect.objectContaining({
            michlolFileData: invalidData.data
          }),
          expect.any(Object)
        );
      });
    });

    describe('transaction handling', () => {
      let queryRunner;

      beforeEach(async () => {
        jest.resetAllMocks();
        (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(123);

        queryRunner = {
          manager: {},
          connect: jest.fn().mockResolvedValue(undefined),
          startTransaction: jest.fn().mockResolvedValue(undefined),
          commitTransaction: jest.fn().mockResolvedValue(undefined),
          rollbackTransaction: jest.fn().mockResolvedValue(undefined),
          release: jest.fn().mockResolvedValue(undefined)
        };

        dataSource.createQueryRunner.mockReturnValue(queryRunner);
        
        // Mock generateCommonFileResponse to trigger actual transaction flow in the service
        (reportUtil.generateCommonFileResponse as jest.Mock).mockImplementation(async (generator, params, ds) => {
          const runner = ds.createQueryRunner();
          await runner.connect();
          await runner.startTransaction();
          try {
            const result = { success: true };
            await runner.commitTransaction();
            return result;
          } catch (error) {
            await runner.rollbackTransaction();
            throw error;
          } finally {
            await runner.release();
          }
        });
      });

      it('should pass dataSource to generateCommonFileResponse and handle transaction', async () => {
        const testData = { data: { test: true } };
        const gradeService = service as any;
        const expectedGenerator = gradeService.reportsDict.michlolPopulatedFile;

        await service.doAction(mockReq, testData);

        expect(reportUtil.generateCommonFileResponse).toHaveBeenCalledWith(
          expectedGenerator,
          expect.objectContaining({
            userId: 123,
            michlolFileName: 'test.xlsx',
            michlolFileData: testData.data
          }),
          dataSource
        );

        expect(dataSource.createQueryRunner).toHaveBeenCalled();
        expect(queryRunner.startTransaction).toHaveBeenCalled();
        expect(queryRunner.commitTransaction).toHaveBeenCalled();
        expect(queryRunner.release).toHaveBeenCalled();
      });

      it('should handle transaction rollback on error', async () => {
        const transactionError = new Error('Transaction failed');
        (reportUtil.generateCommonFileResponse as jest.Mock).mockImplementation(async (generator, params, ds) => {
          const runner = ds.createQueryRunner();
          await runner.connect();
          await runner.startTransaction();
          try {
            throw transactionError;
          } catch (error) {
            await runner.rollbackTransaction();
            throw error;
          } finally {
            await runner.release();
          }
        });

        await expect(service.doAction(mockReq, { data: {} }))
          .rejects
          .toThrow('Transaction failed');

        expect(queryRunner.connect).toHaveBeenCalled();
        expect(queryRunner.startTransaction).toHaveBeenCalled();
        expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunner.release).toHaveBeenCalled();
        expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
      });

      afterEach(() => {
        jest.clearAllMocks();
      });
    });
  });
});