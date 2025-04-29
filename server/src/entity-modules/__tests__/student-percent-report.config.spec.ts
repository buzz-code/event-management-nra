import { CrudRequest } from '@dataui/crud';
import { DataSource, Repository } from 'typeorm';
import { StudentPercentReport } from 'src/db/view-entities/StudentPercentReport.entity';
import { IColumn, IHeader } from '@shared/utils/exporter/types';
import config from '../student-percent-report.config';

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('StudentPercentReportConfig', () => {
  let dataSource: DataSource;
  let service: any;
  let mockRepos: Record<string, MockRepository<any>>;
  let mainRepository: Repository<StudentPercentReport>;

  beforeEach(async () => {
    mainRepository = {
      target: StudentPercentReport,
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

    mockRepos = {
      AttReportAndGrade: {
        find: jest.fn(),
      },
      KnownAbsence: {
        find: jest.fn(),
      },
      Lesson: {
        find: jest.fn(),
      },
      GradeName: {
        find: jest.fn(),
      },
      AbsCountEffectByUser: {
        find: jest.fn(),
      },
      GradeEffectByUser: {
        find: jest.fn(),
      },
    };

    dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === StudentPercentReport) {
          return mainRepository;
        }
        return mockRepos[entity.name];
      }),
    } as unknown as DataSource;

    const mockMailService = {
      sendMail: jest.fn(),
    };

    service = new config.service(mainRepository, mockMailService as any);
    service.dataSource = dataSource;
  });

  describe('getConfig', () => {
    it('should return correct entity config', () => {
      expect(config.entity).toBe(StudentPercentReport);
      expect(config.query.join).toEqual({
        student: {},
        teacher: {},
        lesson: {},
        klass: { eager: true },
        studentBaseKlass: { eager: true },
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
        teacher: { eager: true },
        klass: { eager: true },
        lesson: { eager: true },
        studentBaseKlass: { eager: true },
      });
      expect(innerFunc).toHaveBeenCalledWith(req);
    });

    it('should return correct export headers', () => {
      const entityColumns = [
        'teacher.name',
        'student.name',
        'studentBaseKlass.klassName',
        'klass.name',
        'lesson.name',
        'lessonsCount',
        'absCount',
        'absPercents',
        'attPercents',
        'gradeAvg',
      ];
      const headers = config.exporter?.getExportHeaders(entityColumns) ?? [];
      expect(headers).toBeDefined();
      expect(headers).toHaveLength(10);
      const labels = headers.map((h: IHeader) => {
        if (typeof h === 'string') return h;
        return (h as IColumn).label;
      });
      expect(labels).toEqual([
        'שם המורה',
        'שם התלמידה',
        'כיתת בסיס',
        'כיתה',
        'שיעור',
        'מספר שיעורים',
        'מספר חיסורים',
        'אחוז חיסור',
        'אחוז נוכחות',
        'ציון ממוצע',
      ]);
    });
  });

  describe('populatePivotData', () => {
    interface ExtendedStudentPercentReport extends StudentPercentReport {
      estimation?: string;
      comments?: string;
      attGradeEffect?: number;
      finalGrade?: string;
      headers?: any[];
    }

    const mockData: ExtendedStudentPercentReport[] = [{
      id: '1_1_1_1_1_2023',
      studentReferenceId: 1,
      teacherReferenceId: 1,
      klassReferenceId: 1,
      lessonReferenceId: 1,
      userId: 1,
      year: 2023,
      absCount: 5,
      lessonsCount: 10,
      absPercents: 0.2,
      attPercents: 0.8,
      gradeAvg: 85,
      student: null,
      teacher: null,
      lesson: null,
      klass: null,
      studentBaseKlass: null,
    }];

    const mockReportData = [{
      studentReferenceId: 1,
      teacherReferenceId: 1,
      klassReferenceId: 1,
      lessonReferenceId: 1,
      userId: 1,
      year: 2023,
      type: 'grade',
      grade: 3,
      estimation: 'Good',
      comments: 'Nice work',
      reportDate: new Date(),
    }];

    const mockAbsences = [{
      studentReferenceId: 1,
      klassReferenceId: 1,
      lessonReferenceId: 1,
      userId: 1,
      year: 2023,
    }];

    const mockLessons = [{
      id: '1',
      howManyLessons: 10,
    }];

    const mockGradeNames = [{
      userId: 1,
      key: 'A',
      value: '90-100',
    }];

    const mockEffects = [{
      id: '1_0',
      effect: -5,
    }];

    beforeEach(() => {
      mockRepos.AttReportAndGrade.find.mockResolvedValue(mockReportData);
      mockRepos.KnownAbsence.find.mockResolvedValue(mockAbsences);
      mockRepos.Lesson.find.mockResolvedValue(mockLessons);
      mockRepos.GradeName.find.mockResolvedValue(mockGradeNames);
      mockRepos.AbsCountEffectByUser.find.mockResolvedValue(mockEffects);
      mockRepos.GradeEffectByUser.find.mockResolvedValue([]);
    });

    it('should populate percent report with dates', async () => {
      const extra = {
        fromDate: '2023-01-01',
        toDate: '2023-12-31',
        lastGrade: false,
      };

      const auth = { id: 1 };

      await service.populatePivotData('PercentReportWithDates', mockData, extra, {}, auth);

      expect(mockRepos.AttReportAndGrade.find).toHaveBeenCalled();
      expect(mockRepos.KnownAbsence.find).toHaveBeenCalled();
      expect(mockRepos.Lesson.find).toHaveBeenCalled();
      expect(mockRepos.GradeName.find).toHaveBeenCalled();

      expect(mockData[0].estimation).toBe('Good');
      expect(mockData[0].comments).toBe('Nice work');
      expect(mockData[0].attGradeEffect).toBe(-5);
      expect(mockData[0].gradeAvg).toBe(0.03);
    });

    it('should handle empty data arrays', async () => {
      mockRepos.AttReportAndGrade.find.mockResolvedValue([]);
      mockRepos.KnownAbsence.find.mockResolvedValue([]);
      mockRepos.Lesson.find.mockResolvedValue([]);

      await service.populatePivotData('PercentReportWithDates', mockData, {}, {}, { id: 1 });

      expect(mockData[0].estimation).toBe('');
      expect(mockData[0].comments).toBe('');
    });

    it('should use last grade when lastGrade is true', async () => {
      const extra = { lastGrade: true };
      await service.populatePivotData('PercentReportWithDates', mockData, extra, {}, { id: 1 });
      expect(mockData[0].gradeAvg).toBeDefined();
    });
  });
});