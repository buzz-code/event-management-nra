import { deepMerge } from '../deepMerge';

describe('deepMerge', () => {
  it('returns objB when objA is null or not an object', () => {
    expect(deepMerge(null, { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge(undefined, { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge('string', { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge(123, { a: 1 })).toEqual({ a: 1 });
  });

  it('merges simple objects', () => {
    const objA = { a: 1, b: 2 };
    const objB = { b: 3, c: 4 };
    const expected = { a: 1, b: 3, c: 4 };
    expect(deepMerge(objA, objB)).toEqual(expected);
  });

  it('performs deep merge of nested objects', () => {
    const objA = {
      a: 1,
      nested: {
        x: 1,
        y: 2
      }
    };
    const objB = {
      b: 2,
      nested: {
        y: 3,
        z: 4
      }
    };
    const expected = {
      a: 1,
      b: 2,
      nested: {
        x: 1,
        y: 3,
        z: 4
      }
    };
    expect(deepMerge(objA, objB)).toEqual(expected);
  });

  it('merges arrays in objects', () => {
    const objA = {
      arr: [1, 2, 3],
      other: 'value'
    };
    const objB = {
      arr: [4, 5],
      new: 'prop'
    };
    const result = deepMerge(objA, objB);
    expect(result.arr).toEqual([4, 5]); // Arrays get replaced by objB's array
    expect(result.other).toBe('value');
    expect(result.new).toBe('prop');
  });

  it('preserves object references when no changes are needed', () => {
    const objA = { a: 1, b: { x: 1 } };
    const objB = { c: 2 };
    const result = deepMerge(objA, objB);
    expect(result.b).not.toBe(objA.b); // Due to JSON.parse(JSON.stringify())
    expect(result.b).toEqual(objA.b);
  });

  it('handles null values in objects', () => {
    const objA = { a: 1, b: null };
    const objB = { b: 2, c: null };
    const expected = { a: 1, b: 2, c: null };
    expect(deepMerge(objA, objB)).toEqual(expected);
  });

  it('handles empty objects', () => {
    const objA = {};
    const objB = {};
    expect(deepMerge(objA, objB)).toEqual({});
  });

  it('handles complex nested structures', () => {
    const objA = {
      a: {
        b: {
          c: 1,
          d: [1, 2]
        },
        e: 'string'
      }
    };
    const objB = {
      a: {
        b: {
          d: [3],
          f: true
        },
        g: null
      }
    };
    const expected = {
      a: {
        b: {
          c: 1,
          d: [3], // Array from objB replaces the one in objA
          f: true
        },
        e: 'string',
        g: null
      }
    };
    expect(deepMerge(objA, objB)).toEqual(expected);
  });
});