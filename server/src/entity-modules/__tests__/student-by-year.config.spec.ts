import config, { Utils } from '../student-by-year.config';
import { StudentByYear } from "src/db/view-entities/StudentByYear.entity";
import { DataSource, EntityMetadata, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { ReportMonthSemester } from 'src/db/entities/ReportMonth.entity';
import { ParsedRequestParams } from '@dataui/crud-request';
import { MailSendService } from '@shared/utils/mail/mail-send.service';

jest.mock('@shared/utils/validation/max-count-by-user-limit.ts', () => ({
  MaxCountByUserLimit: jest.fn().mockImplementation(() => jest.fn())
}));

interface MockStudent extends StudentByYear {
  total?: number;
  totalLessons?: number;
  totalKnownAbsences?: number;
  unApprovedAbsences?: number;
  absencePercentage?: string;
  totalAbsencePercentage?: string;
  headers?: any[];
}

describe('StudentByYear Config', () => {
  let service: BaseEntityService<any>;
  let module: TestingModule;
  let mockDataSource: Partial<DataSource>;
  let mockRepository: Repository<any>;
  let mockMailService: Partial<MailSendService>;

  beforeEach(async () => {
    const mockRepository = {
      target: StudentByYear,
      manager: {
        transaction: jest.fn((cb) => cb()),
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
      getRepository: jest.fn().mockReturnValue({
        find: jest.fn().mockResolvedValue([])
      })
    };

    mockMailService = {
      sendMail: jest.fn().mockResolvedValue(undefined)
    };

    module = await Test.createTestingModule({
      providers: [
        {
          provide: DataSource,
          useValue: mockDataSource
        },
        {
          provide: 'CONFIG',
          useValue: config
        },
        {
          provide: MailSendService,
          useValue: mockMailService
        },
        {
          provide: config.service,
          useFactory: () => {
            const service = new config.service(mockRepository, mockMailService as MailSendService);
            service.dataSource = mockDataSource as DataSource;
            return service;
          }
        }
      ]
    }).compile();

    service = module.get<BaseEntityService<any>>(config.service);
  });

  describe('getConfig', () => {
    it('should return correct configuration', () => {
      expect(config.entity).toBe(StudentByYear);
      expect(config.exporter).toBeDefined();
      expect(config.exporter.getExportHeaders([])).toEqual([
        { value: 'id', label: 'מזהה' },
        { value: 'tz', label: 'תעודת זהות' },
        { value: 'name', label: 'שם' },
        { value: 'year', label: 'שנה' },
      ]);
    });
  });

  describe('StudentByYearService', () => {
    it('should populate pivot data for StudentAttendance', async () => {
      const mockStudents: MockStudent[] = [
        {
          id: 1,
          userId: 100,
          year: ['2023'],
          name: 'Test 1',
          tz: '123',
          klassReferenceIds: ['1'],
          klassTypeReferenceIds: ['1']
        },
        {
          id: 2,
          userId: 100,
          year: ['2023'],
          name: 'Test 2',
          tz: '456',
          klassReferenceIds: ['1'],
          klassTypeReferenceIds: ['1']
        }
      ];

      const mockAttReports = [
        {
          studentReferenceId: 1,
          lessonReferenceId: 101,
          lesson: { name: 'Math' },
          absCount: 2,
          howManyLessons: 10
        },
        {
          studentReferenceId: 2,
          lessonReferenceId: 101,
          lesson: { name: 'Math' },
          absCount: 3,
          howManyLessons: 10
        }
      ];

      const mockKnownAbsences = [
        {
          studentReferenceId: 1,
          absnceCount: 1,
          isApproved: true
        },
        {
          studentReferenceId: 2,
          absnceCount: 2,
          isApproved: true
        }
      ];

      (mockDataSource.getRepository as jest.Mock)
        .mockImplementation((entity) => ({
          find: jest.fn()
            .mockImplementation(() => {
              if (entity.name === 'AttReportWithReportMonth') {
                return Promise.resolve(mockAttReports);
              } else if (entity.name === 'KnownAbsenceWithReportMonth') {
                return Promise.resolve(mockKnownAbsences);
              }
            })
        }));

      const filter = [
        { field: 'year', value: '2023' }
      ] as ParsedRequestParams<any>['filter'];

      // Access the protected method through type casting
      await (service as any).populatePivotData(
        'StudentAttendance',
        mockStudents,
        { isCheckKlassType: false },
        filter,
        {}
      );

      // Verify the first student's data
      expect(mockStudents[0].total).toBe(2);
      expect(mockStudents[0].totalLessons).toBe(10);
      expect(mockStudents[0].totalKnownAbsences).toBe(1);
      expect(mockStudents[0].unApprovedAbsences).toBe(1);
      expect(mockStudents[0].absencePercentage).toBe('10%');
      expect(mockStudents[0].totalAbsencePercentage).toBe('20%');

      // Verify headers were added
      expect(mockStudents[0].headers).toBeDefined();
      expect(mockStudents[0].headers).toContainEqual({
        value: '101',
        label: 'Math'
      });
    });
  });

  describe('Utils', () => {
    describe('getReportMonthFilter', () => {
      it('should return filter with id when only id is provided', () => {
        const result = Utils.getReportMonthFilter(1, null);
        expect(result).toEqual({ id: 1 });
      });

      it('should return filter with semester when only semester is provided', () => {
        const result = Utils.getReportMonthFilter(null, ReportMonthSemester.first);
        expect(result).toEqual({ semester: ReportMonthSemester.first });
      });

      it('should return filter with both when both are provided', () => {
        const result = Utils.getReportMonthFilter(1, ReportMonthSemester.first);
        expect(result).toEqual({ id: 1, semester: ReportMonthSemester.first });
      });

      it('should return undefined when neither is provided', () => {
        const result = Utils.getReportMonthFilter(null, null);
        expect(result).toBeUndefined();
      });
    });

    describe('getKlassFilter', () => {
      it('should return filter when both conditions are true', () => {
        const result = Utils.getKlassFilter(true, 1);
        expect(result).toEqual({ klassTypeReferenceId: 1 });
      });

      it('should return undefined when isCheckKlassType is false', () => {
        const result = Utils.getKlassFilter(false, 1);
        expect(result).toBeUndefined();
      });

      it('should return undefined when klassTypeReferenceId is not provided', () => {
        const result = Utils.getKlassFilter(true, null);
        expect(result).toBeUndefined();
      });
    });
  });
});