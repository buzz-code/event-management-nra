import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { User } from "@shared/entities/User.entity";
import { IHeader } from "@shared/utils/exporter/types";
import { getHebrewDateFormatter } from "@shared/utils/formatting/formatter.util";
import { AttReport } from "src/db/entities/AttReport.entity";
import { roundObjectProperty } from "src/utils/reportData.util";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: AttReport,
        query: {
            join: {
                studentBaseKlass: { eager: true },
                student: {},
                teacher: {},
                lesson: {},
                klass: {},
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    student: { eager: true },
                    teacher: { eager: true },
                    klass: { eager: true },
                    lesson: { eager: true }
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'teacher.name', label: 'שם המורה' },
                    { value: 'student.name', label: 'שם התלמידה' },
                    { value: 'klass.name', label: 'כיתה' },
                    { value: 'lesson.name', label: 'שיעור' },
                    { value: 'reportDate', label: 'תאריך דיווח' },
                    { value: getHebrewDateFormatter('reportDate'), label: 'תאריך עברי' },
                    { value: 'howManyLessons', label: 'מספר שיעורים' },
                    { value: 'absCount', label: 'מספר חיסורים' },
                    // { value: 'approvedAbsCount', label: 'מספר חיסורים מאושרים' },
                    // { value: 'sheetName', label: 'חודש דיווח' },
                    { value: 'comments', label: 'הערות' },
                ];
            },
            getImportDefinition(importFields) {
                return {
                    importFields: [
                        'klassId',
                        'studentTz',
                        '',
                        'lateCount',
                        'absCount',
                        'comments',
                    ],
                    specialFields: [
                        { cell: { c: 2, r: 0 }, value: 'teacherId' },
                        { cell: { c: 2, r: 1 }, value: 'lessonId' },
                        { cell: { c: 4, r: 0 }, value: 'reportDate' },
                        { cell: { c: 4, r: 1 }, value: 'howManyLessons' },
                    ],
                    hardCodedFields: [
                        { field: 'reportDate', value: new Date() },
                    ],
                    beforeSave: calcAttLateCount,
                };
            }
        }
    }
}

export default getConfig();

export const calcAttLateCount = (report: AttReport & { lateCount: number }, user: User) => {
    report.absCount = isNaN(report.absCount) ? 0 : Number(report.absCount);
    report.lateCount = isNaN(report.lateCount) ? 0 : Number(report.lateCount);
    const lateValue = user.additionalData?.lateValue ?? 0.3;
    report.absCount += report.lateCount * lateValue;
    roundObjectProperty(report, 'absCount');
    delete report.lateCount;
}
