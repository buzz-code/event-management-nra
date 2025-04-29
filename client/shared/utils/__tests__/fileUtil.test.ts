import { readAsDataURL, readAsBinaryString, readAsExcel } from '../fileUtil';
import * as XLSX from 'xlsx';

// Mock XLSX
jest.mock('xlsx', () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn()
  }
}));

describe('fileUtil', () => {
  let mockFileReader: any;
  const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

  beforeEach(() => {
    // Mock FileReader
    mockFileReader = {
      readAsDataURL: jest.fn(),
      readAsBinaryString: jest.fn(),
      onload: null,
      onerror: null,
    };
    
    // Set up the FileReader mock
    global.FileReader = jest.fn(() => mockFileReader) as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('readAsDataURL', () => {
    it('resolves with the result when successful', async () => {
      const expectedResult = 'data:text/plain;base64,dGVzdCBjb250ZW50';
      
      const resultPromise = readAsDataURL(mockFile);
      
      // Trigger the load event with the expected result
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
      mockFileReader.onload({ target: { result: expectedResult } });

      const result = await resultPromise;
      expect(result).toBe(expectedResult);
    });

    it('rejects when there is an error', async () => {
      const error = new Error('Read error');
      
      const resultPromise = readAsDataURL(mockFile);
      
      // Trigger the error event
      mockFileReader.onerror(error);

      await expect(resultPromise).rejects.toEqual(error);
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('readAsBinaryString', () => {
    it('resolves with the result when successful', async () => {
      const expectedResult = 'binary content';
      
      const resultPromise = readAsBinaryString(mockFile);
      
      // Trigger the load event with the expected result
      expect(mockFileReader.readAsBinaryString).toHaveBeenCalledWith(mockFile);
      mockFileReader.onload({ target: { result: expectedResult } });

      const result = await resultPromise;
      expect(result).toBe(expectedResult);
    });

    it('rejects when there is an error', async () => {
      const error = new Error('Read error');
      
      const resultPromise = readAsBinaryString(mockFile);
      
      // Trigger the error event
      mockFileReader.onerror(error);

      await expect(resultPromise).rejects.toEqual(error);
      expect(mockFileReader.readAsBinaryString).toHaveBeenCalledWith(mockFile);
    });
  });

  describe('readAsExcel', () => {
    it('reads excel file and converts to JSON', async () => {
      const fields = ['field1', 'field2'];
      const mockJsonData = [{ field1: 'value1', field2: 'value2' }];
      const mockWorkbook = {
        SheetNames: ['Sheet1'],
        Sheets: {
          Sheet1: {}
        }
      };

      // Start reading excel
      const resultPromise = readAsExcel(mockFile, fields);

      // Simulate successful binary string read
      expect(mockFileReader.readAsBinaryString).toHaveBeenCalledWith(mockFile);
      mockFileReader.onload({ target: { result: 'mock binary content' } });

      // Mock XLSX operations
      (XLSX.read as jest.Mock).mockReturnValue(mockWorkbook);
      (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue(mockJsonData);

      const result = await resultPromise;

      expect(XLSX.read).toHaveBeenCalledWith('mock binary content', {
        type: 'binary',
        cellText: false,
        cellDates: true
      });
      expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith(
        mockWorkbook.Sheets.Sheet1,
        { header: fields, range: 1 }
      );
      expect(result).toEqual(mockJsonData);
    });

    it('handles excel reading options', async () => {
      const fields = ['field1'];
      const xlsxOptions = { raw: true };
      
      // Start reading excel
      const resultPromise = readAsExcel(mockFile, fields, xlsxOptions);

      // Simulate successful binary string read
      mockFileReader.onload({ target: { result: 'mock binary content' } });

      // Mock XLSX operations
      (XLSX.read as jest.Mock).mockReturnValue({
        SheetNames: ['Sheet1'],
        Sheets: { Sheet1: {} }
      });

      await resultPromise;

      expect(XLSX.utils.sheet_to_json).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          header: fields,
          range: 1,
          raw: true
        })
      );
    });

    it('rejects when file reading fails', async () => {
      const error = new Error('Read error');
      const fields = ['field1'];
      
      const resultPromise = readAsExcel(mockFile, fields);
      
      // Trigger the error event
      mockFileReader.onerror(error);

      await expect(resultPromise).rejects.toEqual(error);
    });
  });
});