import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { TeacherSalaryReport } from "src/db/view-entities/TeacherSalaryReport.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: TeacherSalaryReport,
        query: {
            join: {
                teacher: {},
                lesson: {},
                klass: {},
                reportMonth: {},
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    teacher: { eager: true },
                    klass: { eager: true },
                    lesson: { eager: true },
                    reportMonth: { eager: true }
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'teacher.name', label: 'שם המורה' },
                    { value: 'klass.name', label: 'כיתה' },
                    { value: 'lesson.name', label: 'שיעור' },
                    { value: 'reportMonth.name', label: 'חודש דיווח' },
                    { value: 'howManyLessons', label: 'מספר שיעורים' },
                    { value: 'year', label: 'שנה' },
                ];
            }
        },
    }
}

export default getConfig();