import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Event } from "src/db/entities/Event.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Event,
        query: {
            join: {
                eventType: { eager: false },
                teacher: { eager: false },
                student: { eager: false },
                levelType: { eager: false },
                notes: { eager: false },
                eventGifts: { eager: false },
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    eventType: { eager: true },
                    teacher: { eager: true },
                    student: { eager: true },
                    levelType: { eager: true }
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'name', label: 'כותרת' },
                    { value: 'description', label: 'תיאור' },
                    { value: 'eventDate', label: 'תאריך אירוע' },
                    { value: 'completed', label: 'הושלם' },
                    { value: 'grade', label: 'ציון' },
                    { value: 'eventType.name', label: 'סוג אירוע' },
                    { value: 'teacher.firstName', label: 'שם מורה פרטי' },
                    { value: 'teacher.lastName', label: 'שם מורה משפחה' },
                    { value: 'student.firstName', label: 'שם תלמיד פרטי' },
                    { value: 'student.lastName', label: 'שם תלמיד משפחה' },
                    { value: 'levelType.name', label: 'סוג רמה' }
                ];
            }
        }
    }
}

export default getConfig();