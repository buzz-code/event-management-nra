import { CrudAuthWithPermissionsFilter } from "@shared/auth/crud-auth.filter";
import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { User } from "src/db/entities/User.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: User,
        crudAuth: CrudAuthWithPermissionsFilter(permissions => permissions.showUsersData),
    }
}

export default getConfig();