import { CrudRequest } from '@dataui/crud';
import { CrudAuthCustomFilter, getUserIdFilter } from '@shared/auth/crud-auth.filter';
import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { Teacher } from 'src/db/entities/Teacher.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: Teacher,
    crudAuth: CrudAuthCustomFilter((user) => {
      const userFilter: Partial<Teacher> = getUserIdFilter(user);
      if (user.permissions?.teacher) {
        userFilter.ownUserId = user.id;
      }
      return userFilter;
    }),
    query: {
      join: {
        user: { eager: false },
        ownUser: { eager: false },
        events: { eager: false },
      },
    },
    exporter: {
      processReqForExport(req: CrudRequest, innerFunc) {
        req.options.query.join = {
          user: { eager: true },
          ownUser: { eager: true },
        };
        return innerFunc(req);
      },
      getExportHeaders(): IHeader[] {
        return [
          { value: 'tz', label: 'ת.ז.' },
          { value: 'name', label: 'שם' },
          { value: 'ownUser.email', label: 'כתובת מייל' },
          { value: 'ownUser.username', label: 'שם משתמש' },
        ];
      },
    },
  };
}

export default getConfig();
