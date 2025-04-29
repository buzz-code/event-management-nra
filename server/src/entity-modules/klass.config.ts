import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Klass } from "src/db/entities/Klass.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Klass,
        query: {
            join: {
                teacher: {},
                klassType: {},
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    klassType: { eager: true },
                    teacher: { eager: true },
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'key', label: 'מזהה' },
                    { value: 'name', label: 'שם' },
                    { value: 'klassType.name', label: 'סוג כיתה' },
                    { value: 'teacher.name', label: 'מורה' },
                    { value: 'displayName', label: 'שם לתעודה' },
                ];
            }
        }
    }
}

export default getConfig();