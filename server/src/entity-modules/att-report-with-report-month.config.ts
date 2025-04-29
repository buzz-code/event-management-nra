import { CrudRequest } from "@dataui/crud";
import { In } from "typeorm";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { AttReportWithReportMonth } from "src/db/view-entities/AttReportWithReportMonth.entity";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { AttReport } from "src/db/entities/AttReport.entity";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";
import { validateBulk } from "@shared/base-entity/base-entity.util";
import { fixReferences } from "@shared/utils/entity/fixReference.util";
import { getHebrewDateFormatter } from "@shared/utils/formatting/formatter.util";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: AttReportWithReportMonth,
        query: {
            join: {
                studentBaseKlass: { eager: true },
                student: {},
                teacher: {},
                lesson: {},
                klass: {},
                reportMonth: {},
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    studentBaseKlass: { eager: true },
                    student: { eager: true },
                    teacher: { eager: true },
                    klass: { eager: true },
                    lesson: { eager: true },
                    reportMonth: { eager: true },
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
                    { value: 'reportMonth.name', label: 'חודש דיווח' },
                    { value: 'reportDate', label: 'תאריך דיווח' },
                    { value: getHebrewDateFormatter('reportDate'), label: 'תאריך עברי' },
                    { value: 'howManyLessons', label: 'מספר שיעורים' },
                    { value: 'absCount', label: 'מספר חיסורים' },
                    // { value: 'approvedAbsCount', label: 'מספר חיסורים מאושרים' },
                    // { value: 'sheetName', label: 'חודש דיווח' },
                    { value: 'comments', label: 'הערות' },
                ];
            }
        },
        service: AttReportWithReportMonthService,
    }
}


class AttReportWithReportMonthService<T extends Entity | AttReportWithReportMonth> extends BaseEntityService<T> {
    async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'bulkKnownAbsences': {
                const ids = req.parsed.extra.ids.toString().split(',');
                const reports = await this.dataSource.getRepository(AttReport).findBy({ id: In(ids) });

                const knownAbsences: Array<Partial<KnownAbsence>> = reports.map(report => ({
                    userId: report.userId,
                    studentReferenceId: report.studentReferenceId,
                    klassReferenceId: report.klassReferenceId,
                    lessonReferenceId: report.lessonReferenceId,
                    reportDate: req.parsed.extra.reportDate,
                    absnceCount: req.parsed.extra.absnceCount,
                    absnceCode: req.parsed.extra.absnceCode,
                    senderName: req.parsed.extra.senderName,
                    reason: req.parsed.extra.reason,
                    comment: req.parsed.extra.comment,
                    isApproved: req.parsed.extra.isApproved,
                    year: report.year,
                }))
                await validateBulk<T>(knownAbsences, KnownAbsence);
                await this.dataSource.getRepository(KnownAbsence).insert(knownAbsences);

                return `נוצרו ${reports.length} חיסורים מאושרים`;
            }
            case 'fixReferences': {
                const ids = req.parsed.extra.ids.toString().split(',');
                const referenceFields = {
                    studentTz: 'studentReferenceId',
                    klassId: 'klassReferenceId',
                    lessonId: 'lessonReferenceId',
                };
                return fixReferences(this.dataSource.getRepository(AttReport), ids, referenceFields);
            }
        }
        return super.doAction(req, body);
    }
}

export default getConfig();
