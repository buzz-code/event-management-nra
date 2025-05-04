import { CrudRequest } from "@dataui/crud";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Teacher } from "src/db/entities/Teacher.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Teacher,
        query: {
            join: {
                user: { eager: false },
                events: { eager: false }
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    user: { eager: true }
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'tz', label: 'ת.ז.' },
                    { value: 'firstName', label: 'שם פרטי' },
                    { value: 'lastName', label: 'שם משפחה' },
                    { value: 'user.email', label: 'כתובת מייל' },
                    { value: 'user.username', label: 'שם משתמש' }
                ];
            }
        }
    }
}

export default getConfig();