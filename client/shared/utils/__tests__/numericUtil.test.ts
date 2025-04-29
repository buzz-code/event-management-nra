import { round } from '../numericUtil';

describe('numericUtil', () => {
  describe('round', () => {
    it('rounds to 2 decimal places by default', () => {
      expect(round(3.14159)).toBeCloseTo(3.14, 2);
      expect(round(2.0)).toBeCloseTo(2.00, 2);
      expect(round(-3.14159)).toBeCloseTo(-3.14, 2);
    });

    it('rounds to specified decimal places', () => {
      expect(round(3.14159, 3)).toBeCloseTo(3.142, 3);
      expect(round(2.0, 1)).toBeCloseTo(2.0, 1);
      expect(round(-3.14159, 4)).toBeCloseTo(-3.1416, 4);
    });

    it('handles edge cases', () => {
      expect(round(0, 2)).toBeCloseTo(0, 2);
      expect(round(1.015, 2)).toBeCloseTo(1.02, 2);
      expect(round(9.999, 2)).toBeCloseTo(10.00, 2);
      expect(round(-1.015, 2)).toBeCloseTo(-1.02, 2);
    });

    it('rounds large numbers', () => {
      expect(round(1234567.89123, 2)).toBeCloseTo(1234567.89, 2);
      expect(round(-1234567.89123, 2)).toBeCloseTo(-1234567.89, 2);
    });

    it('handles zero decimal places', () => {
      expect(round(3.14159, 0)).toBe(3);
      expect(round(2.9, 0)).toBe(3);
      expect(round(-3.14159, 0)).toBe(-3);
    });

    it('handles odd rounding cases correctly', () => {
      // JavaScript's Math.round rounds halfway values away from zero
      expect(round(1.5, 0)).toBe(2);    // 1.5 rounds up to 2
      expect(round(2.5, 0)).toBe(3);    // 2.5 rounds up to 3
      expect(round(-1.5, 0)).toBe(-2);  // -1.5 rounds to -2
      expect(round(-2.5, 0)).toBe(-3);  // -2.5 rounds to -3
    });
  });
});