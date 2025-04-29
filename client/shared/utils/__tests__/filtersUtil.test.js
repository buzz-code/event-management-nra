import { filterArrayByParams } from '../filtersUtil';

describe('filtersUtil', () => {
  describe('filterArrayByParams', () => {
    it('filters out falsy values from static array', () => {
      const items = [true, false, null, undefined, 0, 1, '', 'text'];
      const result = filterArrayByParams(items, {});
      expect(result).toEqual([true, 1, 'text']);
    });

    it('executes functions with params and filters results', () => {
      const params = { min: 5, max: 10 };
      const items = [
        params => params.min > 3,
        params => params.max < 8,
        params => params.min * 2
      ];
      const result = filterArrayByParams(items, params);
      expect(result).toEqual([true, 10]);
    });

    it('handles mixed array of functions and static values', () => {
      const params = { value: 42 };
      const items = [
        true,
        params => params.value > 40,
        false,
        'static',
        params => params.value < 30,
        null
      ];
      const result = filterArrayByParams(items, params);
      expect(result).toEqual([true, true, 'static']);
    });

    it('handles empty array', () => {
      const result = filterArrayByParams([], {});
      expect(result).toEqual([]);
    });

    it('handles array with all falsy values', () => {
      const items = [false, null, undefined, 0, '', NaN];
      const result = filterArrayByParams(items, {});
      expect(result).toEqual([]);
    });

    it('handles functions that return falsy values', () => {
      const params = { test: true };
      const items = [
        () => false,
        () => null,
        () => undefined,
        () => 0,
        () => '',
        params => params.test
      ];
      const result = filterArrayByParams(items, params);
      expect(result).toEqual([true]);
    });

    it('preserves order of truthy values', () => {
      const items = [1, false, 2, null, 3];
      const result = filterArrayByParams(items, {});
      expect(result).toEqual([1, 2, 3]);
    });

    it('handles functions with complex logic', () => {
      const params = { a: 5, b: 10 };
      const items = [
        params => params.a + params.b > 10,  // true
        params => params.a * params.b === 50, // true
        params => params.a + params.b        // 15
      ];
      const result = filterArrayByParams(items, params);
      expect(result).toEqual([true, true, 15]); // Third function returns the actual sum
    });
  });
});