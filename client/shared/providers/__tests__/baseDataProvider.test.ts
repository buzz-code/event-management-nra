import baseDataProvider from '../baseDataProvider';
import { fetchUtils } from 'ra-core';
import saveAs from 'file-saver';
import { CondOperator } from '@nestjsx/crud-request';
import { GetListParams, SortPayload } from 'react-admin';

// Mock file-saver
jest.mock('file-saver', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Cast saveAs as jest.Mock
const mockSaveAs = saveAs as unknown as jest.Mock;

// Mock fetch for blob handling
global.fetch = jest.fn();

describe('baseDataProvider', () => {
  const apiUrl = 'http://api.test';
  const httpClient = jest.fn();
  const provider = baseDataProvider(apiUrl, httpClient);

  beforeEach(() => {
    httpClient.mockClear();
    mockSaveAs.mockClear();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('getList', () => {
    const params: GetListParams = {
      pagination: { page: 1, perPage: 10 },
      sort: { field: 'id', order: 'ASC' } as SortPayload,
      filter: {
        name: 'test',
        $OR: { title: 'test' },
        q: { search: 'test' },
        extra: { format: 'json' },
      },
    };

    it('formats the query correctly', async () => {
      httpClient.mockResolvedValueOnce({
        json: { data: [], total: 0 },
      });

      await provider.getList('posts', params);

      expect(httpClient).toHaveBeenCalledWith(
        expect.stringMatching(/http:\/\/api\.test\/posts\?.*filter%5B0%5D=name%7C%7C%24contL%7C%7Ctest/)
      );
    });

    it('handles the response correctly', async () => {
      const responseData = {
        data: [{ id: 1, title: 'test' }],
        total: 1,
      };
      httpClient.mockResolvedValueOnce({ json: responseData });

      const result = await provider.getList('posts', params);

      expect(result).toEqual(responseData);
    });
  });

  describe('getOne', () => {
    it('fetches a single resource', async () => {
      const response = { id: 1, title: 'test' };
      httpClient.mockResolvedValueOnce({ json: response });

      const result = await provider.getOne('posts', { id: 1 });

      expect(httpClient).toHaveBeenCalledWith('http://api.test/posts/1');
      expect(result).toEqual({ data: response });
    });
  });

  describe('getMany', () => {
    it('fetches multiple resources', async () => {
      const response = { data: [{ id: 1 }, { id: 2 }] };
      httpClient.mockResolvedValueOnce({ json: response });

      const result = await provider.getMany('posts', { ids: [1, 2] });

      expect(httpClient).toHaveBeenCalledWith(
        expect.stringMatching(/filter%5B0%5D=id%7C%7C%24in%7C%7C1%2C2/)
      );
      expect(result).toEqual({ data: response.data });
    });
  });

  describe('update', () => {
    it('sends only changed fields', async () => {
      const previousData = { id: 1, title: 'old', content: 'test' };
      const data = { id: 1, title: 'new', content: 'test' };
      httpClient.mockResolvedValueOnce({ json: data });

      await provider.update('posts', { id: 1, previousData, data });

      expect(httpClient).toHaveBeenCalledWith(
        'http://api.test/posts/1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ title: 'new' }),
        })
      );
    });
  });

  describe('create', () => {
    it('creates a new resource', async () => {
      const data = { title: 'new post' };
      httpClient.mockResolvedValueOnce({ json: { id: 1, ...data } });

      const result = await provider.create('posts', { data });

      expect(httpClient).toHaveBeenCalledWith(
        'http://api.test/posts',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data),
        })
      );
      expect(result).toEqual({ data: { id: 1, title: 'new post' } });
    });
  });

  describe('delete', () => {
    it('deletes a resource', async () => {
      httpClient.mockResolvedValueOnce({ json: { id: 1 } });

      await provider.delete('posts', { id: 1 });

      expect(httpClient).toHaveBeenCalledWith(
        'http://api.test/posts/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('deleteMany', () => {
    it('deletes multiple resources', async () => {
      httpClient.mockResolvedValue({ json: {} });

      await provider.deleteMany('posts', { ids: [1, 2] });

      expect(httpClient).toHaveBeenCalledTimes(2);
      expect(httpClient).toHaveBeenCalledWith(
        'http://api.test/posts/1',
        expect.objectContaining({ method: 'DELETE' })
      );
      expect(httpClient).toHaveBeenCalledWith(
        'http://api.test/posts/2',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('export', () => {
    it('handles file export', async () => {
      const params: GetListParams = {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'id', order: 'ASC' } as SortPayload,
        filter: {},
      };

      const mockBlob = new Blob(['test'], { type: 'application/json' });
      const disposition = 'attachment; filename="test.json"';
      httpClient.mockResolvedValueOnce({
        json: {
          type: 'application/json',
          data: 'base64data',
          disposition,
        },
      });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        blob: () => Promise.resolve(mockBlob),
      });

      await provider.export('posts', params, 'json', 'Posts');

      expect(mockSaveAs).toHaveBeenCalledWith(mockBlob, 'test.json');
    });
  });

  describe('getCount', () => {
    it('fetches count of resources', async () => {
      httpClient.mockResolvedValueOnce({ json: { count: 42 } });

      const result = await provider.getCount('posts', {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'id', order: 'ASC' } as SortPayload,
        filter: {},
      });

      expect(httpClient).toHaveBeenCalledWith(
        expect.stringMatching(/posts\/get-count\?.*sort%5B0%5D=id%2CASC/)
      );
      expect(result).toBe(42);
    });
  });

  describe('Query composition', () => {
    it('composes filter with proper operator for different types', async () => {
      const params: GetListParams = {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'id', order: 'ASC' } as SortPayload,
        filter: {
          nullField: null,
          arrayField: [1, 2],
          boolField: true,
          numberField: 42,
          stringField: 'test',
        },
      };

      httpClient.mockResolvedValueOnce({ json: { data: [], total: 0 } });

      await provider.getList('posts', params);

      const url = httpClient.mock.calls[0][0];
      expect(url).toMatch(/nullField%7C%7C%24isnull/);
      expect(url).toMatch(/arrayField%7C%7C%24in%7C%7C1%2C2/);
      expect(url).toMatch(/boolField%7C%7C%24eq%7C%7Ctrue/);
      expect(url).toMatch(/numberField%7C%7C%24eq%7C%7C42/);
      expect(url).toMatch(/stringField%7C%7C%24contL%7C%7Ctest/);
    });

    it('handles nested filters correctly', async () => {
      const params: GetListParams = {
        pagination: { page: 1, perPage: 10 },
        sort: { field: 'author.name', order: 'ASC' } as SortPayload,
        filter: {
          'author.email': 'test@example.com',
        },
      };

      httpClient.mockResolvedValueOnce({ json: { data: [], total: 0 } });

      await provider.getList('posts', params);

      const url = httpClient.mock.calls[0][0];
      expect(url).toMatch(/join%5B0%5D=author/);
      expect(url).toMatch(/author\.email%7C%7C%24contL%7C%7Ctest%40example\.com/);
    });
  });
});