import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { EventType } from "src/db/entities/EventType.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: EventType,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'name', label: 'שם' },
                    { value: 'description', label: 'תיאור' },
                    { value: 'created_at', label: 'תאריך יצירה' },
                    { value: 'updated_at', label: 'תאריך עדכון' },
                ];
            }
        },
    }
}

export default getConfig();