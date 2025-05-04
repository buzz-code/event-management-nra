import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Event } from "src/db/entities/Event.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Event,
        query: {
            join: {
                eventType: {},
                teacher: {},
                student: {},
                coursePath: {},
                notes: {},
                eventGifts: {},
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    eventType: { eager: true },
                    teacher: { eager: true },
                    student: { eager: true },
                    coursePath: { eager: true }
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'title', label: 'כותרת' },
                    { value: 'description', label: 'תיאור' },
                    { value: 'start_date', label: 'תאריך התחלה' },
                    { value: 'end_date', label: 'תאריך סיום' },
                    { value: 'completed', label: 'הושלם' },
                    { value: 'grade', label: 'ציון' },
                    { value: 'eventType.name', label: 'סוג אירוע' },
                    { value: 'teacher.first_name', label: 'שם מורה פרטי' },
                    { value: 'teacher.last_name', label: 'שם מורה משפחה' },
                    { value: 'student.first_name', label: 'שם תלמיד פרטי' },
                    { value: 'student.last_name', label: 'שם תלמיד משפחה' },
                    { value: 'coursePath.name', label: 'מסלול' },
                    { value: 'created_at', label: 'תאריך יצירה' },
                    { value: 'updated_at', label: 'תאריך עדכון' },
                ];
            }
        }
    }
}

export default getConfig();