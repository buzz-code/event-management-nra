import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Teacher } from "src/db/entities/Teacher.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Teacher,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'tz', label: 'תז' },
                    { value: 'name', label: 'שם' },
                    { value: 'phone', label: 'טלפון' },
                    { value: 'phone2', label: 'טלפון 2' },
                    { value: 'email', label: 'כתובת מייל' },
                    { value: 'displayName', label: 'שם לתצוגה' },
                ];
            }
        },
    }
}

export default getConfig();