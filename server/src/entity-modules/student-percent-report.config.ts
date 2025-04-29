import { CrudRequest } from "@dataui/crud";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { getPercentsFormatter } from "@shared/utils/formatting/formatter.util";
import { AbsCountEffectByUser } from "@shared/view-entities/AbsCountEffectByUser.entity";
import { GradeEffectByUser } from "@shared/view-entities/GradeEffectByUser.entity";
import { AttGradeEffect } from "src/db/entities/AttGradeEffect";
import { GradeName } from "src/db/entities/GradeName.entity";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";
import { Lesson } from "src/db/entities/Lesson.entity";
import { AttReportAndGrade } from "src/db/view-entities/AttReportAndGrade.entity";
import { StudentPercentReport } from "src/db/view-entities/StudentPercentReport.entity";
import { calcSum, getUniqueValues, groupDataByKeys, groupDataByKeysAndCalc } from "src/utils/reportData.util";
import { calcReportsData, getDisplayGrade, getUnknownAbsCount } from "src/utils/studentReportData.util";
import { getKnownAbsenceFilterBySprAndDates, getReportDataFilterBySprAndDates } from "src/utils/studentReportData.util";
import { DataSource, In } from "typeorm";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentPercentReport,
        query: {
            join: {
                student: {},
                teacher: {},
                lesson: {},
                klass: { eager: true },
                studentBaseKlass: { eager: true },
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    student: { eager: true },
                    teacher: { eager: true },
                    klass: { eager: true },
                    lesson: { eager: true },
                    studentBaseKlass: { eager: true },
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'teacher.name', label: 'שם המורה' },
                    { value: 'student.name', label: 'שם התלמידה' },
                    { value: 'studentBaseKlass.klassName', label: 'כיתת בסיס' },
                    { value: 'klass.name', label: 'כיתה' },
                    { value: 'lesson.name', label: 'שיעור' },
                    { value: 'lessonsCount', label: 'מספר שיעורים' },
                    { value: 'absCount', label: 'מספר חיסורים' },
                    { value: getPercentsFormatter('absPercents'), label: 'אחוז חיסור' },
                    { value: getPercentsFormatter('attPercents'), label: 'אחוז נוכחות' },
                    { value: getPercentsFormatter('gradeAvg'), label: 'ציון ממוצע' },
                ];
            }
        },
        service: StudentPercentReportService,
    }
}

interface StudentPercentReportWithDates extends StudentPercentReport {
    approvedAbsCount?: number;
    attGradeEffect?: number;
    finalGrade?: string;
    estimation?: string;
    comments?: string;
}
class StudentPercentReportService<T extends Entity | StudentPercentReport> extends BaseEntityService<T> {
    protected async populatePivotData(pivotName: string, list: T[], extra: any, filter: any, auth: any) {
        const data = list as StudentPercentReport[];
        const sprIds = data.map(item => item.id);
        const sprMap: Record<string, StudentPercentReportWithDates> = data.reduce((a, b) => ({ ...a, [b.id]: b }), {});


        switch (pivotName) {
            case 'PercentReportWithDates': {
                const pivotData = await this.dataSource
                    .getRepository(AttReportAndGrade)
                    .find({ where: getReportDataFilterBySprAndDates(sprIds, extra?.fromDate, extra?.toDate), order: { reportDate: 'ASC' } });
                const pivotDataMap = groupDataByKeys(pivotData, ['studentReferenceId', 'teacherReferenceId', 'klassReferenceId', 'lessonReferenceId', 'userId', 'year']);

                const totalAbsencesData = await this.dataSource
                    .getRepository(KnownAbsence)
                    .find({ where: getKnownAbsenceFilterBySprAndDates(sprIds, extra?.fromDate, extra?.toDate) });
                const totalAbsencesDataMap = groupDataByKeys(totalAbsencesData, ['studentReferenceId', 'klassReferenceId', 'lessonReferenceId', 'userId', 'year']);

                const estimatedLessonCount = await this.dataSource
                    .getRepository(Lesson)
                    .find({ where: { id: In(getUniqueValues(pivotData, item => item.lessonReferenceId)) } });
                const estimatedLessonCountMap = groupDataByKeysAndCalc(estimatedLessonCount, ['id'], items => ({ howManyLessons: calcSum(items, item => item.howManyLessons) }));

                Object.entries(sprMap).forEach(([key, val]) => {
                    const reports = pivotDataMap[key] ?? [];
                    const knownAbsKey = [val.studentReferenceId, val.klassReferenceId, val.lessonReferenceId, val.userId, val.year].map(String).join('_');
                    const knownAbs = totalAbsencesDataMap[knownAbsKey] ?? [];
                    const estimatedLessonCount = estimatedLessonCountMap[val.lessonReferenceId]?.howManyLessons ?? 0;

                    const reportData = calcReportsData(reports, knownAbs, estimatedLessonCount);
                    val.lessonsCount = reportData.lessonsCount;
                    val.absCount = reportData.absCount;
                    val.approvedAbsCount = reportData.approvedAbsCount;
                    val.absPercents = reportData.absPercents;
                    val.attPercents = reportData.attPercents;
                    val.gradeAvg = extra?.lastGrade ? reportData.lastGrade : reportData.gradeAvg;

                    const gradeReports = reports.filter(item => item.type === 'grade');
                    val.estimation = getUniqueValues(gradeReports, item => item.estimation).join(', ');
                    val.comments = getUniqueValues(gradeReports, item => item.comments).join(', ');
                });

                const [absCountEffectsMap, gradeEffectsMap] = await getAbsGradeEffect(Object.values(sprMap), this.dataSource);
                const gradeNames = await this.dataSource.getRepository(GradeName)
                    .find({ where: { userId: getUserIdFromUser(auth) }, order: { key: 'DESC' } });

                Object.values(sprMap).forEach(item => {
                    item.attGradeEffect = gradeEffectsMap[getGradeEffectId(item)] ?? absCountEffectsMap[getAbsCountEffectId(item)];
                    item.finalGrade = getDisplayGrade(item.gradeAvg, item.attGradeEffect, gradeNames);
                });

                const headers = {};
                headers['attGradeEffect'] = { value: 'attGradeEffect', label: 'קשר נוכחות ציון' };
                headers['finalGrade'] = { value: 'finalGrade', label: 'ציון סופי' };
                headers['estimation'] = { value: 'estimation', label: 'הערכה' };
                headers['comments'] = { value: 'comments', label: 'הערה' };
                headers['estimatedAbsPercents'] = { value: 'estimatedAbsPercents', label: 'אחוז חיסור משוער' };
                (data[0] as any).headers = Object.values(headers);
            }
        }
    }
}

async function getAbsGradeEffect(values: StudentPercentReportWithDates[], dataSource: DataSource) {
    const uniqueAbsCountEffectIds = getUniqueValues(values, getAbsCountEffectId);
    const uniqueGradeEffectIds = getUniqueValues(values, getGradeEffectId);

    const [absCountEffectsMap, gradeEffectsMap] = await Promise.all([
        fetchAttGradeEffect(dataSource, AbsCountEffectByUser, uniqueAbsCountEffectIds),
        fetchAttGradeEffect(dataSource, GradeEffectByUser, uniqueGradeEffectIds),
    ]);

    return [absCountEffectsMap, gradeEffectsMap];
}

function getAbsCountEffectId(item: StudentPercentReportWithDates): string {
    return `${item.userId}_${getUnknownAbsCount(item.absCount, item.approvedAbsCount)}`;
}

function getGradeEffectId(item: StudentPercentReportWithDates): string {
    return `${item.userId}_${Math.floor(item.attPercents * 100)}`;
}

function fetchAttGradeEffect(dataSource: DataSource, viewEntity: any, ids: string[]): Promise<Record<string, number>> {
    return dataSource
        .getRepository(viewEntity)
        .find({
            where: {
                id: In(ids),
            },
            select: ['id', 'effect'],
        })
        .then(arr => Object.fromEntries(arr.map(item => [item.id, item.effect])));
}

export default getConfig();