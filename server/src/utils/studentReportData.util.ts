import { calcAvg, calcPercents, calcSum, getNumericValueOrNull, keepBetween, roundFractional } from "src/utils/reportData.util";
import { getReportDateFilter } from "@shared/utils/entity/filters.util";
import { FindOptionsWhere, FindOperator, In, Not, Any } from "typeorm";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";
import { AttReportAndGrade } from "src/db/view-entities/AttReportAndGrade.entity";
import { AttGradeEffect } from "src/db/entities/AttGradeEffect";
import { GradeName } from "src/db/entities/GradeName.entity";

interface ISprIdData {
    studentReferenceId: string;
    teacherReferenceId: string;
    klassReferenceId: string;
    lessonReferenceId: string;
    userId: string;
    year: string;
}
export function breakSprId(id: string): ISprIdData {
    const [studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, userId, year] = id.split('_');
    return {
        studentReferenceId,
        teacherReferenceId,
        klassReferenceId,
        lessonReferenceId,
        userId,
        year,
    };
}

export function getReportDataFilterBySprAndDates(ids: string[], startDate: Date, endDate: Date): FindOptionsWhere<AttReportAndGrade>[] {
    return ids.map(id => {
        const { studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, userId, year } = breakSprId(id);
        return ({
            studentReferenceId: getNumericValueOrNull(studentReferenceId),
            teacherReferenceId: getNumericValueOrNull(teacherReferenceId),
            klassReferenceId: getNumericValueOrNull(klassReferenceId),
            lessonReferenceId: getNumericValueOrNull(lessonReferenceId),
            userId: getNumericValueOrNull(userId),
            year: getNumericValueOrNull(year),
            reportDate: getReportDateFilter(startDate, endDate),
        });
    });
}

export function getKnownAbsenceFilterBySprAndDates(ids: string[], startDate: Date, endDate: Date): FindOptionsWhere<KnownAbsence>[] {
    return ids.map(id => {
        const { studentReferenceId, userId, year } = breakSprId(id);
        return {
            isApproved: true,
            userId: getNumericValueOrNull(userId),
            studentReferenceId: getNumericValueOrNull(studentReferenceId),
            reportDate: getReportDateFilter(startDate, endDate),
            year: getNumericValueOrNull(year),
        };
    });
}

export function getReportsFilterForReportCard(studentId: number, year: number, reportDateFilter: FindOperator<any>, globalLessonIdsStr: string, denyLessonIdStr: string): FindOptionsWhere<AttReportAndGrade>[] {
    const denyLessonIds = denyLessonIdStr.split(',').filter(item => item != 'undefined');
    const lessonFilter: FindOperator<number> = denyLessonIds.length ? Not(In(denyLessonIds)) : undefined;
    const commonFilter = { studentReferenceId: studentId, year, lessonReferenceId: lessonFilter };
    const globalLessonIds = globalLessonIdsStr.split(',').filter(item => item != 'undefined');

    if (reportDateFilter && globalLessonIds.length) {
        return [
            { ...commonFilter, reportDate: reportDateFilter },
            { ...commonFilter, lessonReferenceId: In(globalLessonIds) },
        ];
    } else if (reportDateFilter) {
        return [{ ...commonFilter, reportDate: reportDateFilter }];
    } else if (globalLessonIds.length) {
        return [{ ...commonFilter, lessonReferenceId: In(globalLessonIds) }];
    } else {
        return [{ ...commonFilter }];
    }
}

interface IStudentReportData {
    lessonsCount: number;
    absCount: number;
    approvedAbsCount: number;
    attPercents: number;
    absPercents: number;
    gradeAvg: number;
    lastGrade: number;
    estimatedAttPercents?: number;
    estimatedAbsPercents?: number;
}
export function calcReportsData(data: AttReportAndGrade[], totalAbsencesData: { absnceCount: number }[], estimatedLessonCount?: number): IStudentReportData {
    const lessonsCount = calcSum(data, item => item.howManyLessons);
    const absCount = calcSum(data, item => item.absCount);
    const approvedAbsCount = calcSum(totalAbsencesData, item => item.absnceCount);
    const unapprovedAbsCount = getUnknownAbsCount(absCount, approvedAbsCount);
    const attPercents = getAttPercents(lessonsCount, unapprovedAbsCount) / 100;
    const absPercents = 1 - attPercents;

    const grades = data.filter(item => item.type === 'grade');
    let gradeAvg = null, lastGrade = null;
    if (grades.length) {
        gradeAvg = roundFractional(calcAvg(grades, item => item.grade) / 100);
        lastGrade = (grades.at(-1)?.grade ?? 0) / 100;
    }

    let estimatedAttPercents, estimatedAbsPercents;
    if (estimatedLessonCount) {
        estimatedAttPercents = getAttPercents(estimatedLessonCount, unapprovedAbsCount) / 100;
        estimatedAbsPercents = 1 - estimatedAttPercents;
    }

    return {
        lessonsCount,
        absCount,
        approvedAbsCount,
        attPercents,
        absPercents,
        gradeAvg,
        lastGrade,
        estimatedAttPercents,
        estimatedAbsPercents,
    };
}

export function getAttCount(lessonsCount: number, absCount: number) {
    return keepBetween(lessonsCount - absCount, 0, lessonsCount);
}

export function getAttPercents(lessonsCount: number, absCount: number) {
    return calcPercents(getAttCount(lessonsCount, absCount), lessonsCount);
}

export function getUnknownAbsCount(absCount: number, knownAbs: number) {
    return Math.max(0, (absCount ?? 0) - (knownAbs ?? 0));
}

export function getDisplayGrade(grade: number, gradeEffect: number = 0, gradeNames: GradeName[] = []) {
    // if (grade === 0) return '0%';
    if (!grade) return '';
    var finalGrade = getFinalGrade(grade * 100, gradeEffect);
    var matchingGradeName = getGradeName(gradeNames, finalGrade);
    var displayGrade = matchingGradeName ?? (Math.round(finalGrade) + '%');
    return displayGrade;
}

function getFinalGrade(grade: number, gradeEffect: number) {
    var isOriginalGrade = grade > 100 || grade == 0;
    var finalGrade = isOriginalGrade ? grade : keepBetween(grade + gradeEffect, 0, 100);
    return finalGrade;
}

function getGradeName(gradeNames: GradeName[], finalGrade: number) {
    return gradeNames?.find(item => item.key <= finalGrade)?.name || null;
}

export function getGradeEffect(attGradeEffect: AttGradeEffect[], attPercents: number, absCount: number) {
    const actualPercents = attPercents * 100;
    return attGradeEffect?.find(item => item.percents <= actualPercents || item.count >= absCount)?.effect ?? 0;
}

export function getDisplayable(entity?: { name: string, displayName?: string }) {
    return entity?.displayName || entity?.name;
}
