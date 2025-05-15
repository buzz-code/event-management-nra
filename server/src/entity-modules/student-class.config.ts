import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { StudentClass } from '../db/entities/StudentClass.entity';
import { IHeader } from '@shared/utils/exporter/types';
import { CrudRequest } from '@dataui/crud';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: StudentClass,
    query: {
      join: {
        student: { eager: false },
        class: { eager: false },
      },
    },
    exporter: {
      processReqForExport(req: CrudRequest, innerFunc) {
        req.options.query.join = {
          student: { eager: true },
          class: { eager: true },
        };
        return innerFunc(req);
      },
      getExportHeaders(): IHeader[] {
        return [
          { value: 'student.name', label: 'שם תלמיד' },
          { value: 'class.name', label: 'שם כיתה' },
          { value: 'year', label: 'שנה' },
        ];
      },
    },
  };
}

export default getConfig();
