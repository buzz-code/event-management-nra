import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { KnownAbsence } from "src/db/entities/KnownAbsence.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: KnownAbsence,
        query: {
            join: {
                student: {},
            }
        },
    }
}

export default getConfig();