import studentConfig from '../student.config';
import { Student } from 'src/db/entities/Student.entity';
import { BulkToPdfReportGenerator } from '@shared/utils/report/bulk-to-pdf.generator';
import { getUserIdFromUser } from '@shared/auth/auth.util';
import { generateStudentReportCard } from 'src/reports/reportGenerator';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { CommonReportData, CommonFileFormat } from '@shared/utils/report/types';
import { BaseReportGenerator } from '@shared/utils/report/report.generators';
import { Repository } from 'typeorm';
import { MailSendService } from '@shared/utils/mail/mail-send.service';

// Mock dependencies
jest.mock('@shared/auth/auth.util');
jest.mock('src/reports/reportGenerator');
jest.mock('@shared/utils/report/bulk-to-pdf.generator');
jest.mock('@shared/utils/mail/mail-send.service');

// Create a mock generator for testing
class MockReportGenerator extends BaseReportGenerator {
  fileFormat = CommonFileFormat.Pdf;
  
  constructor() {
    super(
      (data) => 'test-report',
      async (params) => params
    );
  }

  async getFileBuffer(data: any): Promise<Buffer> {
    return Buffer.from('mock data');
  }
}

describe('StudentConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use Student entity', () => {
    expect(studentConfig.entity).toBe(Student);
  });

  it('should return correct export headers', () => {
    const fields = ['tz', 'name', 'comment', 'phone', 'year'];
    expect(studentConfig.exporter.getExportHeaders(fields)).toEqual([
      { value: 'tz', label: 'תז' },
      { value: 'name', label: 'שם' },
      { value: 'comment', label: 'הערה' },
      { value: 'phone', label: 'טלפון' },
      { value: 'year', label: 'כתובת' },
    ]);
  });

  describe('StudentService', () => {
    // Properly type the service to include reportsDict
    let service: BaseEntityService<Student> & {
      reportsDict: {
        studentReportCard: BulkToPdfReportGenerator;
        studentReportCardReact: BulkToPdfReportGenerator;
      };
    };
    let mockRepository: jest.Mocked<Repository<Student>>;
    let mockMailService: jest.Mocked<MailSendService>;

    beforeEach(() => {
      // Create minimal mock repository with required properties
      mockRepository = {
        target: Student,
        manager: {
          connection: {
            options: {
              type: 'mysql',
              name: 'default'
            }
          }
        },
        metadata: {
          columns: [],
          relations: [],
          connection: {
            options: {
              type: 'mysql'
            }
          }
        }
      } as any;

      // Create mock mail service
      mockMailService = {
        sendMail: jest.fn()
      } as any;

      // Mock DataSource
      const mockDataSource = {
        createQueryRunner: jest.fn().mockReturnValue({
          connect: jest.fn(),
          startTransaction: jest.fn(),
          commitTransaction: jest.fn(),
          rollbackTransaction: jest.fn(),
          release: jest.fn(),
        })
      };

      // Create service instance with mocks
      const ServiceClass = studentConfig.service;
      // @ts-ignore - Constructor is protected but we need to test the service
      service = new ServiceClass(mockRepository, mockMailService);
      
      // Mock the injected properties
      Object.defineProperty(service, 'dataSource', {
        value: mockDataSource,
        writable: true
      });
      
      Object.defineProperty(service, 'exportDefinition', {
        value: studentConfig.exporter,
        writable: true
      });
    });

    it('should initialize reports dictionary', () => {
      expect(service.reportsDict).toEqual({
        studentReportCard: expect.any(BulkToPdfReportGenerator),
        studentReportCardReact: expect.any(BulkToPdfReportGenerator),
      });
    });

    describe('getReportData', () => {
      const mockUserId = '123';
      const mockExtra = { report: 'studentReportCard', someOption: 'value' };
      const mockReq = {
        auth: { someAuth: true },
        parsed: { 
          extra: mockExtra,
          fields: ['field1', 'field2'],
          search: {},
          filter: {},
          or: [],
          join: {},
          sort: [],
          limit: 10,
          offset: 0,
          page: 1,
          cache: 0
        }
      };

      beforeEach(() => {
        (getUserIdFromUser as jest.Mock).mockReturnValue(mockUserId);
      });

      it('should handle supported report types', async () => {
        const mockGenerator = new MockReportGenerator();
        const mockReportData: CommonReportData = {
          generator: mockGenerator,
          params: { someParams: 'value' }
        };
        (generateStudentReportCard as jest.Mock).mockResolvedValue(mockReportData);

        const result = await service.getReportData(mockReq as any);

        expect(getUserIdFromUser).toHaveBeenCalledWith(mockReq.auth);
        expect(generateStudentReportCard).toHaveBeenCalledWith(
          mockUserId,
          mockExtra,
          expect.any(BulkToPdfReportGenerator)
        );
        expect(result).toBe(mockReportData);
      });

      it('should fallback to parent getReportData for unsupported report types', async () => {
        const unsupportedReq = {
          ...mockReq,
          parsed: {
            ...mockReq.parsed,
            extra: { report: 'unsupported' }
          }
        };

        const mockGenerator = new MockReportGenerator();
        const mockParentResult: CommonReportData = {
          generator: mockGenerator,
          params: { parentParams: 'value' }
        };
        jest.spyOn(BaseEntityService.prototype, 'getReportData')
          .mockResolvedValue(mockParentResult);

        const result = await service.getReportData(unsupportedReq as any);

        expect(result).toBe(mockParentResult);
        expect(generateStudentReportCard).not.toHaveBeenCalled();
      });
    });
  });
});