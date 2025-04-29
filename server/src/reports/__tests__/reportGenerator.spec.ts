import { BaseReportGenerator } from '@shared/utils/report/report.generators';
import { CrudRequest } from '@dataui/crud';
import { DataSource } from 'typeorm';
import { MailSendService } from '@shared/utils/mail/mail-send.service';
import { generateStudentReportCard, getTeacherStatusFileReportParams, sendTeacherReportFileMail } from '../reportGenerator';
import * as yearUtil from '@shared/utils/entity/year.util';
import * as authUtil from '@shared/auth/auth.util';
import * as mailAddressUtil from '@shared/utils/mail/mail-address.util';
import * as bulkMailFileUtil from '@shared/utils/report/bulk-mail-file.util';

jest.mock('@shared/utils/entity/year.util');
jest.mock('@shared/auth/auth.util');
jest.mock('@shared/utils/mail/mail-address.util');
jest.mock('@shared/utils/report/bulk-mail-file.util');

const createMockCrudRequest = (extra: any, auth: any = { id: 'default' }): CrudRequest<any, any> => ({
  parsed: {
    fields: [],
    paramsFilter: [],
    authPersist: [],
    search: {},
    filter: [],
    or: [],
    join: [],
    sort: [],
    limit: 10,
    offset: 0,
    page: 1,
    cache: 0,
    includeDeleted: 0,
    extra,
    classTransformOptions: {}
  },
  options: {
    routes: {
      getManyBase: { interceptors: [], decorators: [] },
      getOneBase: { interceptors: [], decorators: [] },
      createOneBase: { interceptors: [], decorators: [] },
      createManyBase: { interceptors: [], decorators: [] },
      updateOneBase: { interceptors: [], decorators: [] },
      replaceOneBase: { interceptors: [], decorators: [] },
      deleteOneBase: { interceptors: [], decorators: [] },
      recoverOneBase: { interceptors: [], decorators: [] }
    }
  },
  auth
});

describe('reportGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateStudentReportCard', () => {
    it('should generate report card parameters with default year', () => {
      const mockYear = 2025;
      (yearUtil.getCurrentHebrewYear as jest.Mock).mockReturnValue(mockYear);

      const userId = '123';
      const reqExtra = {
        ids: '1,2,3',
        attendance: true,
        grades: true
      };
      const generator: BaseReportGenerator = {} as any;

      const result = generateStudentReportCard(userId, reqExtra, generator);

      expect(result.generator).toBe(generator);
      expect(result.params).toHaveLength(3);
      expect(result.params[0]).toMatchObject({
        userId: '123',
        studentId: '1',
        year: mockYear,
        attendance: true,
        grades: true
      });
    });

    it('should use provided year instead of current year', () => {
      const userId = '123';
      const reqExtra = {
        ids: '1',
        year: 2024
      };
      const generator: BaseReportGenerator = {} as any;

      const result = generateStudentReportCard(userId, reqExtra, generator);

      expect(result.params[0].year).toBe(2024);
    });
  });

  describe('getTeacherStatusFileReportParams', () => {
    it('should generate teacher report parameters', () => {
      const mockUserId = '456';
      (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(mockUserId);

      const mockRequest = createMockCrudRequest({
        ids: '10,20',
        isGrades: true,
        lessonReferenceId: '100'
      }, { id: mockUserId });

      const result = getTeacherStatusFileReportParams(mockRequest);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        userId: mockUserId,
        id: '10',
        isGrades: true,
        lessonReferenceId: 100
      });
    });

    it('should handle undefined lessonReferenceId', () => {
      const mockUserId = '456';
      (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(mockUserId);

      const mockRequest = createMockCrudRequest({
        ids: '10',
        isGrades: true
      }, { id: mockUserId });

      const result = getTeacherStatusFileReportParams(mockRequest);

      expect(result[0].lessonReferenceId).toBeUndefined();
    });
  });

  describe('sendTeacherReportFileMail', () => {
    it('should send teacher report file email', async () => {
      const mockUserId = '789';
      const mockReplyToAddress = 'teacher@test.com';
      const mockRequest = createMockCrudRequest({
        ids: '30',
        isGrades: true,
        mailSubject: 'Report for {0}',
        mailBody: 'Report content for {0}'
      }, { id: mockUserId });

      const mockDataSource = {} as DataSource;
      const mockMailService = {} as MailSendService;

      (authUtil.getUserIdFromUser as jest.Mock).mockReturnValue(mockUserId);
      (mailAddressUtil.getMailAddressForEntity as jest.Mock).mockResolvedValue(mockReplyToAddress);
      (bulkMailFileUtil.sendBulkTeacherMailWithFile as jest.Mock).mockResolvedValue('Success');

      const result = await sendTeacherReportFileMail(mockRequest, mockDataSource, mockMailService);

      expect(result).toBe('Success');
      expect(bulkMailFileUtil.sendBulkTeacherMailWithFile).toHaveBeenCalled();
    });
  });
});