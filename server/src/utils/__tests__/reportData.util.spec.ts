import {
  getNumericValueOrNull,
  calcSum,
  calcAvg,
  roundFractional,
  roundObjectProperty,
  getUniqueValues,
  groupDataByKeys,
  groupDataByKeysAndCalc,
  calcPercents,
  keepBetween,
  getItemById,
} from '../reportData.util';

describe('reportData.util', () => {
  describe('getNumericValueOrNull', () => {
    it('should return null for "null" string', () => {
      expect(getNumericValueOrNull('null')).toBeNull();
    });

    it('should return number for numeric string', () => {
      expect(getNumericValueOrNull('123')).toBe(123);
      expect(getNumericValueOrNull('0')).toBe(0);
      expect(getNumericValueOrNull('-45')).toBe(-45);
      expect(getNumericValueOrNull('3.14')).toBe(3.14);
    });
  });

  describe('calcSum', () => {
    it('should calculate sum of array values', () => {
      const arr = [{ val: 10 }, { val: 20 }, { val: 30 }];
      expect(calcSum(arr, item => item.val)).toBe(60);
    });

    it('should handle null and undefined values', () => {
      const arr = [{ val: 10 }, { val: null }, { val: undefined }, { val: 20 }];
      expect(calcSum(arr, item => item.val)).toBe(30);
    });

    it('should return 0 for empty array', () => {
      expect(calcSum([], item => item.val)).toBe(0);
    });
  });

  describe('calcAvg', () => {
    it('should calculate average of array values', () => {
      const arr = [{ val: 10 }, { val: 20 }, { val: 30 }];
      expect(calcAvg(arr, item => item.val)).toBe(20);
    });

    it('should ignore null and undefined values', () => {
      const arr = [{ val: 10 }, { val: null }, { val: undefined }, { val: 20 }];
      expect(calcAvg(arr, item => item.val)).toBe(15);
    });

    it('should return 0 for empty array', () => {
      expect(calcAvg([], item => item.val)).toBe(0);
    });

    it('should return 0 for array with only null values', () => {
      const arr = [{ val: null }, { val: undefined }];
      expect(calcAvg(arr, item => item.val)).toBe(0);
    });
  });

  describe('roundFractional', () => {
    it('should round to 4 decimal places', () => {
      expect(roundFractional(3.141592653)).toBe(3.1416);
      expect(roundFractional(2.0)).toBe(2);
      expect(roundFractional(1.23456789)).toBe(1.2346);
    });
  });

  describe('roundObjectProperty', () => {
    it('should round numeric property in object', () => {
      const obj = { value: 3.141592653, name: 'test' };
      roundObjectProperty(obj, 'value');
      expect(obj.value).toBe(3.1416);
    });

    it('should handle undefined property', () => {
      const obj = { name: 'test', value: undefined } as { name: string; value?: number };
      roundObjectProperty(obj, 'value');
      expect(obj).toEqual({ name: 'test', value: undefined });
    });

    it('should handle null property', () => {
      const obj = { value: null, name: 'test' } as { name: string; value: number | null };
      roundObjectProperty(obj, 'value');
      expect(obj.value).toBeNull();
    });
  });

  describe('getUniqueValues', () => {
    it('should return unique values from array', () => {
      const arr = [
        { category: 'A' },
        { category: 'B' },
        { category: 'A' },
        { category: 'C' },
        { category: 'B' }
      ];
      const result = getUniqueValues(arr, item => item.category);
      expect(result).toEqual(['A', 'B', 'C']);
    });

    it('should filter out falsy values', () => {
      const arr = [
        { category: 'A' },
        { category: null },
        { category: undefined },
        { category: '' },
        { category: 'B' }
      ];
      const result = getUniqueValues(arr, item => item.category);
      expect(result).toEqual(['A', 'B']);
    });
  });

  describe('groupDataByKeys', () => {
    it('should group data by single key', () => {
      const data = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 }
      ];
      const result = groupDataByKeys(data, ['type']);
      expect(result).toEqual({
        'A': [{ type: 'A', value: 1 }, { type: 'A', value: 3 }],
        'B': [{ type: 'B', value: 2 }]
      });
    });

    it('should group data by multiple keys', () => {
      const data = [
        { type: 'A', category: 'X', value: 1 },
        { type: 'A', category: 'Y', value: 2 },
        { type: 'A', category: 'X', value: 3 }
      ];
      const result = groupDataByKeys(data, ['type', 'category']);
      expect(result).toEqual({
        'A_X': [{ type: 'A', category: 'X', value: 1 }, { type: 'A', category: 'X', value: 3 }],
        'A_Y': [{ type: 'A', category: 'Y', value: 2 }]
      });
    });
  });

  describe('groupDataByKeysAndCalc', () => {
    it('should group data and calculate values', () => {
      const data = [
        { type: 'A', value: 1 },
        { type: 'B', value: 2 },
        { type: 'A', value: 3 }
      ];
      const result = groupDataByKeysAndCalc(data, ['type'], group => group.length);
      expect(result).toEqual({
        'A': 2,
        'B': 1
      });
    });
  });

  describe('calcPercents', () => {
    it('should calculate percentage correctly', () => {
      expect(calcPercents(25, 100)).toBe(25);
      expect(calcPercents(1, 3)).toBe(33);
      expect(calcPercents(2, 3)).toBe(67);
    });

    it('should handle zero total', () => {
      expect(calcPercents(5, 0)).toBe(500);
    });

    it('should round to nearest integer', () => {
      expect(calcPercents(1, 6)).toBe(17);
      expect(calcPercents(1, 7)).toBe(14);
    });
  });

  describe('keepBetween', () => {
    it('should keep value within range', () => {
      expect(keepBetween(5, 1, 10)).toBe(5);
      expect(keepBetween(0, 1, 10)).toBe(1);
      expect(keepBetween(15, 1, 10)).toBe(10);
    });

    it('should handle reversed min/max', () => {
      expect(keepBetween(5, 10, 1)).toBe(5);
      expect(keepBetween(0, 10, 1)).toBe(1);
      expect(keepBetween(15, 10, 1)).toBe(10);
    });
  });

  describe('getItemById', () => {
    it('should find item by id', () => {
      const arr = [
        { id: 1, name: 'first' },
        { id: 2, name: 'second' },
        { id: 3, name: 'third' }
      ];
      expect(getItemById(arr, 2)).toEqual({ id: 2, name: 'second' });
    });

    it('should return undefined for non-existent id', () => {
      const arr = [
        { id: 1, name: 'first' },
        { id: 2, name: 'second' }
      ];
      expect(getItemById(arr, 99)).toBeUndefined();
    });

    it('should work with string ids', () => {
      const arr = [
        { id: 'a', name: 'first' },
        { id: 'b', name: 'second' }
      ];
      expect(getItemById(arr, 'b')).toEqual({ id: 'b', name: 'second' });
    });
  });
});