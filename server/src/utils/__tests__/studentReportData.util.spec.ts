import { Between, In, Not } from 'typeorm';
import {
  breakSprId,
  getReportDataFilterBySprAndDates,
  getKnownAbsenceFilterBySprAndDates,
  getReportsFilterForReportCard,
  calcReportsData,
  getAttCount,
  getAttPercents,
  getUnknownAbsCount,
  getDisplayGrade,
  getGradeEffect
} from '../studentReportData.util';
import { AttReportAndGrade } from 'src/db/view-entities/AttReportAndGrade.entity';
import { GradeName } from 'src/db/entities/GradeName.entity';
import { AttGradeEffect } from 'src/db/entities/AttGradeEffect';

describe('studentReportData.util', () => {
  describe('breakSprId', () => {
    it('should correctly break a student progress report ID into components', () => {
      const id = '123_456_789_101112_131415_2024';
      const result = breakSprId(id);

      expect(result).toEqual({
        studentReferenceId: '123',
        teacherReferenceId: '456',
        klassReferenceId: '789',
        lessonReferenceId: '101112',
        userId: '131415',
        year: '2024'
      });
    });

    it('should handle missing components by returning undefined values', () => {
      const id = '123_456';
      const result = breakSprId(id);

      expect(result.studentReferenceId).toBe('123');
      expect(result.teacherReferenceId).toBe('456');
      expect(result.klassReferenceId).toBeUndefined();
      expect(result.lessonReferenceId).toBeUndefined();
      expect(result.userId).toBeUndefined();
      expect(result.year).toBeUndefined();
    });
  });

  describe('getReportDataFilterBySprAndDates', () => {
    it('should create correct filters from SPR IDs and dates', () => {
      const ids = ['123_456_789_101112_131415_2024'];
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = getReportDataFilterBySprAndDates(ids, startDate, endDate);

      expect(result).toEqual([{
        studentReferenceId: 123,
        teacherReferenceId: 456,
        klassReferenceId: 789,
        lessonReferenceId: 101112,
        userId: 131415,
        year: 2024,
        reportDate: Between(startDate, endDate)
      }]);
    });

    it('should handle multiple SPR IDs', () => {
      const ids = ['123_456_789_101112_131415_2024', '234_567_890_111213_141516_2024'];
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = getReportDataFilterBySprAndDates(ids, startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result[0].studentReferenceId).toBe(123);
      expect(result[1].studentReferenceId).toBe(234);
    });
  });

  describe('getKnownAbsenceFilterBySprAndDates', () => {
    it('should create correct filters for known absences', () => {
      const ids = ['123_456_789_101112_131415_2024'];
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const result = getKnownAbsenceFilterBySprAndDates(ids, startDate, endDate);

      expect(result).toEqual([{
        isApproved: true,
        userId: 131415,
        studentReferenceId: 123,
        reportDate: Between(startDate, endDate),
        year: 2024
      }]);
    });
  });

  describe('getReportsFilterForReportCard', () => {
    it('should create filter with both reportDate and global lessons', () => {
      const reportDateFilter = Between(new Date('2024-01-01'), new Date('2024-12-31'));
      const result = getReportsFilterForReportCard(
        123,
        2024,
        reportDateFilter,
        '1,2,3',
        '4,5'
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        studentReferenceId: 123,
        year: 2024,
        lessonReferenceId: Not(In(['4', '5'])),
        reportDate: reportDateFilter
      });
      expect(result[1]).toEqual({
        studentReferenceId: 123,
        year: 2024,
        lessonReferenceId: In(['1', '2', '3'])
      });
    });

    it('should handle empty deny lesson ids', () => {
      // Test when both global and deny lesson IDs are undefined strings
      const filterResult = getReportsFilterForReportCard(
        123,
        2024,
        null,
        'undefined',
        'undefined'
      );

      expect(filterResult[0]).toMatchObject({
        studentReferenceId: 123,
        year: 2024,
        lessonReferenceId: undefined
      });
    });
  });

  describe('calcReportsData', () => {
    const mockReportData: AttReportAndGrade[] = [
      {
        howManyLessons: 10,
        absCount: 2,
        type: 'grade',
        grade: 8500
      } as AttReportAndGrade,
      {
        howManyLessons: 5,
        absCount: 1,
        type: 'grade',
        grade: 9000
      } as AttReportAndGrade
    ];

    const mockAbsencesData = [
      { absnceCount: 1 },
      { absnceCount: 1 }
    ];

    it('should calculate correct report statistics', () => {
      const result = calcReportsData(mockReportData, mockAbsencesData);

      expect(result.lessonsCount).toBe(15);
      expect(result.absCount).toBe(3);
      expect(result.approvedAbsCount).toBe(2);
      expect(result.attPercents).toBeCloseTo(0.93, 2);
      expect(result.absPercents).toBeCloseTo(0.07, 2);
      expect(result.gradeAvg).toBe(87.5);
      expect(result.lastGrade).toBe(90);
    });

    it('should calculate estimated percentages when estimatedLessonCount is provided', () => {
      const result = calcReportsData(mockReportData, mockAbsencesData, 20);

      expect(result.estimatedAttPercents).toBeCloseTo(0.95, 2);
      expect(result.estimatedAbsPercents).toBeCloseTo(0.05, 2);
    });
  });

  describe('getAttCount', () => {
    it('should return correct attendance count', () => {
      expect(getAttCount(10, 3)).toBe(7);
      expect(getAttCount(10, 0)).toBe(10);
      expect(getAttCount(10, 12)).toBe(0);
    });
  });

  describe('getAttPercents', () => {
    it('should calculate correct attendance percentages', () => {
      expect(getAttPercents(10, 2)).toBe(80);
      expect(getAttPercents(10, 0)).toBe(100);
      expect(getAttPercents(10, 10)).toBe(0);
    });
  });

  describe('getUnknownAbsCount', () => {
    it('should calculate correct unknown absence count', () => {
      expect(getUnknownAbsCount(5, 3)).toBe(2);
      expect(getUnknownAbsCount(5, 5)).toBe(0);
      expect(getUnknownAbsCount(5, 6)).toBe(0);
      expect(getUnknownAbsCount(null, 3)).toBe(0);
      expect(getUnknownAbsCount(5, null)).toBe(5);
    });
  });

  describe('getDisplayGrade', () => {
    const mockGradeNames: GradeName[] = [
      { key: 90, name: 'A' } as GradeName,
      { key: 80, name: 'B' } as GradeName,
      { key: 70, name: 'C' } as GradeName
    ];

    it('should return correct grade display with grade names', () => {
      expect(getDisplayGrade(0.95, 0, mockGradeNames)).toBe('A');
      expect(getDisplayGrade(0.85, 0, mockGradeNames)).toBe('B');
      expect(getDisplayGrade(0.75, 0, mockGradeNames)).toBe('C');
      expect(getDisplayGrade(0.65, 0, mockGradeNames)).toBe('65%');
    });

    it('should handle grade effects', () => {
      expect(getDisplayGrade(0.85, 10, mockGradeNames)).toBe('A');
      expect(getDisplayGrade(0.75, -10, mockGradeNames)).toBe('65%');
    });

    it('should handle edge cases', () => {
      expect(getDisplayGrade(0, 0, mockGradeNames)).toBe('');
      expect(getDisplayGrade(null, 0, mockGradeNames)).toBe('');
      expect(getDisplayGrade(0.85)).toBe('85%');
    });
  });

  describe('getGradeEffect', () => {
    const mockEffects: AttGradeEffect[] = [
      { percents: 90, count: 2, effect: 5 } as AttGradeEffect,
      { percents: 80, count: 3, effect: 0 } as AttGradeEffect,
      { percents: 70, count: 4, effect: -5 } as AttGradeEffect
    ];

    it('should return correct effect based on attendance percentage', () => {
      // Effects are returned for the first matching rule where percents <= actualPercents
      expect(getGradeEffect(mockEffects, 0.95, 1)).toBe(5);  // 95% matches first rule (90%)
      expect(getGradeEffect(mockEffects, 0.85, 1)).toBe(5);  // 85% matches first rule (90%)
      expect(getGradeEffect(mockEffects, 0.75, 1)).toBe(5);  // 75% still matches first rule (90%)
      expect(getGradeEffect(mockEffects, 0.65, 1)).toBe(5);  // 65% still matches first rule (90%)
    });

    it('should return correct effect based on absence count', () => {
      // Effects are returned for the first matching rule where count >= absCount
      expect(getGradeEffect(mockEffects, 0.60, 1)).toBe(5);  // matches first rule (count 2)
      expect(getGradeEffect(mockEffects, 0.60, 2)).toBe(5);  // exactly matches first rule count
      expect(getGradeEffect(mockEffects, 0.60, 3)).toBe(0);  // matches second rule (count 3)
      expect(getGradeEffect(mockEffects, 0.60, 4)).toBe(-5); // matches third rule (count 4)
    });

    it('should handle null or empty effects array', () => {
      expect(getGradeEffect(null, 0.95, 1)).toBe(0);
      expect(getGradeEffect([], 0.95, 1)).toBe(0);
    });
  });
});