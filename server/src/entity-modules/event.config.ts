import { DeepPartial } from "typeorm";
import { CrudRequest } from "@dataui/crud";
import { CrudAuthCustomFilter, getUserIdFilter } from "@shared/auth/crud-auth.filter";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Event } from "src/db/entities/Event.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Event,
        crudAuth: CrudAuthCustomFilter(user => {
            const userFilter: DeepPartial<Event> = getUserIdFilter(user);
            if (user.permissions?.teacher) {
                userFilter['teacher.ownUserId'] = user.id;
            }
            return userFilter;
        }),
        query: {
            join: {
                eventType: { eager: false },
                teacher: { eager: true },
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
                    { value: 'eventHebrewDate', label: 'תאריך עברי' },
                    { value: 'eventHebrewMonth', label: 'חודש עברי' },
                    { value: 'completed', label: 'הושלם' },
                    { value: 'grade', label: 'ציון' },
                    { value: 'eventType.name', label: 'סוג אירוע' },
                    { value: 'teacher.name', label: 'שם מורה' },
                    { value: 'student.name', label: 'שם תלמיד' },
                    { value: 'levelType.name', label: 'סוג רמה' },
                    { value: 'year', label: 'שנה' }
                ];
            }
        },
    }
}

export default getConfig();