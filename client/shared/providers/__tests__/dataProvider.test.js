import dataProvider from '../dataProvider';
import { apiUrl } from '@shared/providers/constantsProvider';
import { fetchJson } from '@shared/utils/httpUtil';

// Mock file-saver
jest.mock('file-saver', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock httpUtil
jest.mock('@shared/utils/httpUtil', () => ({
  fetchJson: jest.fn(),
}));

describe('dataProvider', () => {
  beforeEach(() => {
    fetchJson.mockClear();

    // Mock URL.createObjectURL
    URL.createObjectURL = jest.fn();
    URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    delete URL.createObjectURL;
    delete URL.revokeObjectURL;
  });

  describe('simulateYemotCall', () => {
    it('executes Yemot call simulation', async () => {
      const callData = { phone: '123456789', code: '123' };
      fetchJson.mockResolvedValueOnce({ json: { success: true } });

      await dataProvider.simulateYemotCall(callData);

      expect(fetchJson).toHaveBeenCalledWith(
        `${apiUrl}/yemot/handle-call`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(callData),
        })
      );
    });
  });

  describe('importFile', () => {
    it('creates entities and import file record', async () => {
      const bulk = [{ name: 'test1' }, { name: 'test2' }];
      const createdItems = [
        { id: 1, name: 'test1' },
        { id: 2, name: 'test2' },
      ];

      fetchJson
        .mockResolvedValueOnce({ json: createdItems }) // createMany response
        .mockResolvedValueOnce({ json: { id: 1 } }); // create import_file response

      await dataProvider.importFile('users', bulk, 'test.xlsx');

      // Check createMany call
      expect(fetchJson).toHaveBeenNthCalledWith(
        1,
        `${apiUrl}/users/bulk`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ bulk }),
        })
      );

      // Check import_file creation call
      expect(fetchJson).toHaveBeenNthCalledWith(
        2,
        `${apiUrl}/import_file`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            fileName: 'test.xlsx',
            fileSource: 'קובץ שהועלה',
            entityName: 'users',
            entityIds: [1, 2],
            fullSuccess: true,
            response: 'נשמר',
          }),
        })
      );
    });
  });

  describe('impersonate', () => {
    it('executes impersonation request', async () => {
      const userId = 123;
      fetchJson.mockResolvedValueOnce({ json: { success: true } });

      await dataProvider.impersonate(userId);

      expect(fetchJson).toHaveBeenCalledWith(
        `${apiUrl}/auth/impersonate`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ userId }),
        })
      );
    });
  });

  describe('updateSettings', () => {
    it('updates settings', async () => {
      const settings = { theme: 'dark' };
      fetchJson.mockResolvedValueOnce({ json: { success: true } });

      await dataProvider.updateSettings({ data: settings });

      // Use expect.stringMatching to handle potential trailing slash
      expect(fetchJson).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`${apiUrl}/settings/?$`)),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(settings),
        })
      );
    });
  });

  describe('action', () => {
    it('executes action with query params and body', async () => {
      const queryParams = { filter: 'active' };
      const bodyParams = { status: 'approved' };
      fetchJson.mockResolvedValueOnce({ json: { success: true } });

      await dataProvider.action('users', 'approve', queryParams, bodyParams);

      const expectedUrl = `${apiUrl}/users/action?filter=active&extra.action=approve`;
      expect(fetchJson).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(bodyParams),
        })
      );
    });

    it('executes action with default empty params', async () => {
      fetchJson.mockResolvedValueOnce({ json: { success: true } });

      await dataProvider.action('users', 'approve');

      const expectedUrl = `${apiUrl}/users/action?extra.action=approve`;
      expect(fetchJson).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: '{}',
        })
      );
    });
  });

  describe('actionAndDownload', () => {
    it('executes action with download', async () => {
      const queryParams = { format: 'pdf' };
      const bodyParams = { ids: [1, 2] };
      const mockResponse = {
        json: {
          data: btoa('test pdf content'),
          type: 'application/pdf',
          disposition: 'attachment; filename="report.pdf"',
        },
      };
      
      fetchJson.mockResolvedValueOnce(mockResponse);

      // Mock URL.createObjectURL to return a dummy URL
      URL.createObjectURL.mockReturnValue('blob:dummy-url');

      const result = await dataProvider.actionAndDownload(
        'reports',
        'export',
        queryParams,
        bodyParams
      );

      const expectedUrl = `${apiUrl}/reports/action?format=pdf&extra.action=export`;
      expect(fetchJson).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(bodyParams),
        })
      );
      expect(result).toEqual({ data: {} });
    });

    it('executes download with default empty params', async () => {
      const mockResponse = {
        json: {
          data: btoa('test pdf content'),
          type: 'application/pdf',
          disposition: 'attachment; filename="report.pdf"',
        },
      };
      
      fetchJson.mockResolvedValueOnce(mockResponse);

      // Mock URL.createObjectURL to return a dummy URL
      URL.createObjectURL.mockReturnValue('blob:dummy-url');

      await dataProvider.actionAndDownload('reports', 'export');

      const expectedUrl = `${apiUrl}/reports/action?extra.action=export`;
      expect(fetchJson).toHaveBeenCalledWith(
        expectedUrl,
        expect.objectContaining({
          method: 'POST',
          body: '{}',
        })
      );
    });
  });
});