import { DataSource, Repository } from 'typeorm';
import { User } from 'src/db/entities/User.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { TeacherReportStatus } from 'src/db/view-entities/TeacherReportStatus.entity';
import { TeacherGradeReportStatus } from 'src/db/view-entities/TeacherGradeReportStatus.entity';
import { ReportMonth } from 'src/db/entities/ReportMonth.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { StudentKlass } from 'src/db/entities/StudentKlass.entity';
import teacherReportFileModule, { TeacherReportFileParams, TeacherReportFileData } from '../teacherReportFile';

describe('teacherReportFile', () => {
  let mockDataSource: Partial<DataSource>;
  let mockUserRepo: Partial<Repository<User>>;
  let mockTeacherRepo: Partial<Repository<Teacher>>;
  let mockTeacherReportStatusRepo: Partial<Repository<TeacherReportStatus>>;
  let mockTeacherGradeReportStatusRepo: Partial<Repository<TeacherGradeReportStatus>>;
  let mockReportMonthRepo: Partial<Repository<ReportMonth>>;
  let mockLessonRepo: Partial<Repository<Lesson>>;
  let mockStudentKlassRepo: Partial<Repository<StudentKlass>>;

  beforeEach(() => {
    mockUserRepo = {
      findOneBy: jest.fn(),
    };
    mockTeacherRepo = {
      findOneBy: jest.fn(),
    };
    mockTeacherReportStatusRepo = {
      findOneBy: jest.fn(),
    };
    mockTeacherGradeReportStatusRepo = {
      findOneBy: jest.fn(),
    };
    mockReportMonthRepo = {
      findOneBy: jest.fn(),
    };
    mockLessonRepo = {
      findBy: jest.fn(),
    };
    mockStudentKlassRepo = {
      find: jest.fn(),
    };

    mockDataSource = {
      getRepository: jest.fn((entity) => {
        switch (entity) {
          case User:
            return mockUserRepo as Repository<User>;
          case Teacher:
            return mockTeacherRepo as Repository<Teacher>;
          case TeacherReportStatus:
            return mockTeacherReportStatusRepo as Repository<TeacherReportStatus>;
          case TeacherGradeReportStatus:
            return mockTeacherGradeReportStatusRepo as Repository<TeacherGradeReportStatus>;
          case ReportMonth:
            return mockReportMonthRepo as Repository<ReportMonth>;
          case Lesson:
            return mockLessonRepo as Repository<Lesson>;
          case StudentKlass:
            return mockStudentKlassRepo as Repository<StudentKlass>;
          default:
            return {} as Repository<any>;
        }
      }),
    };
  });

  describe('getReportData', () => {
    const createMockParams = (overrides = {}): TeacherReportFileParams => ({
      id: '1_2_3_2025',
      userId: 1,
      ...overrides,
    });

    it('should return empty array when no lessons to report', async () => {
      const params = createMockParams();

      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1 });
      (mockTeacherRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 2 });
      (mockTeacherReportStatusRepo.findOneBy as jest.Mock).mockResolvedValue({
        notReportedLessons: [],
      });
      (mockReportMonthRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 3 });

      const result = await teacherReportFileModule.getReportData(params, mockDataSource as DataSource);

      expect(result).toEqual([]);
    });

    it('should return empty array when specified lesson is not in notReportedLessons', async () => {
      const params = createMockParams({ lessonReferenceId: 999 });

      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1 });
      (mockTeacherRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 2 });
      (mockTeacherReportStatusRepo.findOneBy as jest.Mock).mockResolvedValue({
        notReportedLessons: ['1', '2', '3'],
      });
      (mockReportMonthRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 3 });

      const result = await teacherReportFileModule.getReportData(params, mockDataSource as DataSource);

      expect(result).toEqual([]);
    });

    it('should handle valid lessonReferenceId', async () => {
      const params = createMockParams({ lessonReferenceId: 1 });
      const mockLesson = {
        id: 1,
        name: 'Math',
        key: 123,
        klassReferenceIds: ['1']
      };
      const mockStudents = [
        {
          klass: { key: 'A1' },
          student: { tz: '123', name: 'Student 1' },
        },
      ];

      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1, name: 'User 1' });
      (mockTeacherRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 2, name: 'Teacher 1', tz: '999' });
      (mockTeacherReportStatusRepo.findOneBy as jest.Mock).mockResolvedValue({
        notReportedLessons: ['1', '2'],
        year: 2025,
        reportMonthName: 'January',
      });
      (mockReportMonthRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 3, name: 'January' });
      (mockLessonRepo.findBy as jest.Mock).mockResolvedValue([mockLesson]);
      (mockStudentKlassRepo.find as jest.Mock).mockResolvedValue(mockStudents);

      const result = await teacherReportFileModule.getReportData(params, mockDataSource as DataSource);

      expect(result).toHaveLength(1);
      expect(mockLessonRepo.findBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('should handle lessons without klassReferenceIds', async () => {
      const params = createMockParams();
      const mockLesson = {
        id: 1,
        name: 'Math',
        key: 123,
        klassReferenceIds: null
      };

      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1, name: 'User 1' });
      (mockTeacherRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 2, name: 'Teacher 1', tz: '999' });
      (mockTeacherReportStatusRepo.findOneBy as jest.Mock).mockResolvedValue({
        notReportedLessons: ['1'],
        year: 2025,
        reportMonthName: 'January',
      });
      (mockReportMonthRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 3, name: 'January' });
      (mockLessonRepo.findBy as jest.Mock).mockResolvedValue([mockLesson]);

      const result = await teacherReportFileModule.getReportData(params, mockDataSource as DataSource);

      expect(result).toHaveLength(1);
      expect(result[0].formattedData).toEqual([]);
      expect(mockStudentKlassRepo.find).not.toHaveBeenCalled();
    });

    it('should generate grade report with students', async () => {
      const params = createMockParams({ isGrades: true });
      const mockLesson = {
        id: 1,
        name: 'Math',
        key: 123,
        klassReferenceIds: ['1', '2']
      };
      const mockStudents = [
        {
          klass: { key: 'A1' },
          student: { tz: '123', name: 'Student 1' },
        },
        {
          klass: { key: 'A2' },
          student: { tz: '456', name: 'Student 2' },
        },
      ];

      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1, name: 'User 1' });
      (mockTeacherRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 2, name: 'Teacher 1', tz: '999' });
      (mockTeacherGradeReportStatusRepo.findOneBy as jest.Mock).mockResolvedValue({
        notReportedLessons: ['1'],
        year: 2025,
        reportMonthName: 'January',
      });
      (mockReportMonthRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 3, name: 'January' });
      (mockLessonRepo.findBy as jest.Mock).mockResolvedValue([mockLesson]);
      (mockStudentKlassRepo.find as jest.Mock).mockResolvedValue(mockStudents);

      const result = await teacherReportFileModule.getReportData(params, mockDataSource as DataSource);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        fileTitle: 'קובץ ציונים',
        headerRow: ['קוד כיתה', 'ת.ז.', 'שם תלמידה', 'ציונים', 'התנהגות א/ב/ג', 'צניעות א/ב/ג'],
        formattedData: [
          ['A1', '123', 'Student 1'],
          ['A2', '456', 'Student 2'],
        ],
        sheetName: 'January',
      });
      expect(result[0].specialFields).toHaveLength(10);
    });

    it('should generate attendance report with students', async () => {
      const params = createMockParams({ isGrades: false });
      const mockLesson = {
        id: 1,
        name: 'Math',
        key: 123,
        klassReferenceIds: ['1']
      };
      const mockStudents = [
        {
          klass: { key: 'A1' },
          student: { tz: '123', name: 'Student 1' },
        },
      ];

      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1, name: 'User 1' });
      (mockTeacherRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 2, name: 'Teacher 1', tz: '999' });
      (mockTeacherReportStatusRepo.findOneBy as jest.Mock).mockResolvedValue({
        notReportedLessons: ['1'],
        year: 2025,
        reportMonthName: 'January',
      });
      (mockReportMonthRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 3, name: 'January' });
      (mockLessonRepo.findBy as jest.Mock).mockResolvedValue([mockLesson]);
      (mockStudentKlassRepo.find as jest.Mock).mockResolvedValue(mockStudents);

      const result = await teacherReportFileModule.getReportData(params, mockDataSource as DataSource);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        fileTitle: 'קובץ נוכחות',
        headerRow: ['קוד כיתה', 'ת.ז.', 'שם תלמידה', 'איחורים', 'חיסורים', 'הערות'],
        formattedData: [
          ['A1', '123', 'Student 1'],
        ],
        sheetName: 'January',
      });
    });

    it('should handle missing reportMonthName', async () => {
      const params = createMockParams();
      const mockLesson = {
        id: 1,
        name: 'Math',
        key: 123,
        klassReferenceIds: ['1']
      };

      (mockUserRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 1, name: 'User 1' });
      (mockTeacherRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 2, name: 'Teacher 1', tz: '999' });
      (mockTeacherReportStatusRepo.findOneBy as jest.Mock).mockResolvedValue({
        notReportedLessons: ['1'],
        year: 2025,
        reportMonthName: null,
      });
      (mockReportMonthRepo.findOneBy as jest.Mock).mockResolvedValue({ id: 3, name: 'January' });
      (mockLessonRepo.findBy as jest.Mock).mockResolvedValue([mockLesson]);
      (mockStudentKlassRepo.find as jest.Mock).mockResolvedValue([]);

      const result = await teacherReportFileModule.getReportData(params, mockDataSource as DataSource);

      expect(result[0].sheetName).toBe('דיווח נוכחות');
    });
  });

  describe('getReportName', () => {
    it('should generate correct report name', () => {
      const mockData: TeacherReportFileData = {
        fileTitle: 'קובץ ציונים',
        teacher: { name: 'Teacher 1' } as Teacher,
        lesson: { name: 'Math' } as Lesson,
        reportMonth: { name: 'January' } as ReportMonth,
        user: { id: 1 } as User,
        teacherReportStatus: { reportMonthName: 'January' } as TeacherReportStatus,
        headerRow: [],
        formattedData: [],
        specialFields: []
      };

      const result = teacherReportFileModule.getReportName(mockData);

      expect(result).toBe('קבצי נוכחות למורה');
    });
  });
});