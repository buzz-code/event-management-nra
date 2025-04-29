import { DataSource, Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { Student } from 'src/db/entities/Student.entity';
import { AttReportAndGrade } from 'src/db/view-entities/AttReportAndGrade.entity';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { AttGradeEffect } from 'src/db/entities/AttGradeEffect';
import michlolPopulatedFile, { MichlolPopulatedFileParams } from '../michlolPopulatedFile';
import * as yearUtil from '@shared/utils/entity/year.util';
import * as reportDataUtil from 'src/utils/reportData.util';
import * as studentReportDataUtil from 'src/utils/studentReportData.util';

jest.mock('@shared/utils/entity/year.util');
jest.mock('src/utils/reportData.util');
jest.mock('src/utils/studentReportData.util');

describe('michlolPopulatedFile', () => {
  let mockDataSource: Partial<DataSource>;
  let mockLessonRepo: Partial<Repository<Lesson>>;
  let mockStudentRepo: Partial<Repository<Student>>;
  let mockAttReportAndGradeRepo: Partial<Repository<AttReportAndGrade>>;
  let mockKnownAbsenceRepo: Partial<Repository<KnownAbsence>>;
  let mockAttGradeEffectRepo: Partial<Repository<AttGradeEffect>>;

  beforeEach(() => {
    mockLessonRepo = {
      findOne: jest.fn(),
    };
    mockStudentRepo = {
      find: jest.fn(),
    };
    mockAttReportAndGradeRepo = {
      find: jest.fn(),
    };
    mockKnownAbsenceRepo = {
      find: jest.fn(),
    };
    mockAttGradeEffectRepo = {
      find: jest.fn(),
    };

    mockDataSource = {
      getRepository: jest.fn((entity) => {
        switch (entity) {
          case Lesson:
            return mockLessonRepo as Repository<Lesson>;
          case Student:
            return mockStudentRepo as Repository<Student>;
          case AttReportAndGrade:
            return mockAttReportAndGradeRepo as Repository<AttReportAndGrade>;
          case KnownAbsence:
            return mockKnownAbsenceRepo as Repository<KnownAbsence>;
          case AttGradeEffect:
            return mockAttGradeEffectRepo as Repository<AttGradeEffect>;
          default:
            return {} as Repository<any>;
        }
      }),
    };

    jest.clearAllMocks();
    (yearUtil.getCurrentHebrewYear as jest.Mock).mockReturnValue(2025);
  });

  const createMockParams = (overrides = {}): any => ({
    userId: 1,
    michlolFileName: 'test.xlsx',
    michlolFileData: [
      { A: '', B: '', C: 'Test Lesson', D: '123 ' },
      { A: '', B: '', C: '', D: '' },
      { A: '', B: '', C: '', D: '' },
      { A: '', B: '123456789', C: 'Student 1', D: '' },
      { A: '', B: '987654321', C: 'Student 2', D: '' },
    ],
    ...overrides,
  });

  describe('getReportData', () => {
    it('should throw BadRequestException for invalid lesson key', async () => {
      const params = createMockParams({
        michlolFileData: [{ A: '', B: '', C: 'Test Lesson', D: 'invalid' }],
      });

      await expect(michlolPopulatedFile.getReportData(params, mockDataSource as DataSource))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should process file with no matching students', async () => {
      const params = createMockParams();
      (mockLessonRepo.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        key: 123,
        name: 'Test Lesson',
        userId: 1,
      });
      (mockStudentRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await michlolPopulatedFile.getReportData(params, mockDataSource as DataSource);

      expect(result).toEqual({
        lesson: {
          id: 1,
          key: 123,
          name: 'Test Lesson',
          userId: 1,
        },
        filename: 'test',
        extension: '.xlsx',
        headerRow: [],
        formattedData: [],
        sheetName: 'נתונים מעודכנים',
        specialFields: expect.any(Array),
      });
    });

    it('should process file with matching students and reports', async () => {
      const params = createMockParams();
      const mockLesson = {
        id: 1,
        key: 123,
        name: 'Test Lesson',
        userId: 1,
      };
      const mockStudents = [
        { id: 1, tz: '123456789' },
        { id: 2, tz: '987654321' },
      ];
      const mockReports = [
        { studentReferenceId: 1, reportDate: '2025-01-01' },
        { studentReferenceId: 2, reportDate: '2025-01-01' },
      ];
      const mockKnownAbsences = [
        { studentReferenceId: 1, isApproved: true },
      ];
      const mockAttGradeEffects = [
        { percents: 90, count: 1 },
      ];

      (mockLessonRepo.findOne as jest.Mock).mockResolvedValue(mockLesson);
      (mockStudentRepo.find as jest.Mock).mockResolvedValue(mockStudents);
      (mockAttReportAndGradeRepo.find as jest.Mock).mockResolvedValue(mockReports);
      (mockKnownAbsenceRepo.find as jest.Mock).mockResolvedValue(mockKnownAbsences);
      (mockAttGradeEffectRepo.find as jest.Mock).mockResolvedValue(mockAttGradeEffects);

      (reportDataUtil.groupDataByKeys as jest.Mock).mockImplementation((data, keys) => {
        const result = {};
        data.forEach(item => {
          const key = item[keys[0]];
          result[key] = [item];
        });
        return result;
      });

      (reportDataUtil.groupDataByKeysAndCalc as jest.Mock).mockReturnValue({
        '123456789': 1,
        '987654321': 2,
      });

      (studentReportDataUtil.calcReportsData as jest.Mock).mockReturnValue({
        attPercents: 85,
        absCount: 2,
        approvedAbsCount: 1,
        gradeAvg: 90,
        lessonsCount: 10,
        lastGrade: 95,
      });

      (studentReportDataUtil.getUnknownAbsCount as jest.Mock).mockReturnValue(1);
      (studentReportDataUtil.getGradeEffect as jest.Mock).mockReturnValue(-5);
      (studentReportDataUtil.getDisplayGrade as jest.Mock).mockReturnValue('90%');

      const result = await michlolPopulatedFile.getReportData(params, mockDataSource as DataSource);

      expect(result).toEqual({
        lesson: mockLesson,
        filename: 'test',
        extension: '.xlsx',
        headerRow: [],
        formattedData: [],
        sheetName: 'נתונים מעודכנים',
        specialFields: expect.any(Array),
      });

      // Verify the updated grades in specialFields
      const gradeFields = result.specialFields.filter(field => field.cell.c === 4);
      expect(gradeFields.some(field => field.value === '90')).toBeTruthy();
    });
  });

  describe('getReportName', () => {
    it('should generate correct report name', async () => {
      const params = createMockParams();
      const mockLesson = {
        key: 123,
        name: 'Test Lesson',
      };
      (mockLessonRepo.findOne as jest.Mock).mockResolvedValue(mockLesson);
      (mockStudentRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await michlolPopulatedFile.getReportData(params, mockDataSource as DataSource);
      const reportName = michlolPopulatedFile.getReportName(result);

      expect(reportName).toBe('123 - Test Lesson');
    });
  });
});