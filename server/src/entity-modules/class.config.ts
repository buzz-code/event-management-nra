import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Class } from "src/db/entities/Class.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Class,
        query: {
            join: {
                students: {}
            }
        },
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'name', label: 'שם' },
                    { value: 'grade_level', label: 'רמת כיתה' },
                    { value: 'created_at', label: 'תאריך יצירה' },
                    { value: 'updated_at', label: 'תאריך עדכון' },
                ];
            }
        }
    }
}

export default getConfig();