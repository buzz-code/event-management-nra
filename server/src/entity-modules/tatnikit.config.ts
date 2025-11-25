import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { Tatnikit } from '../db/entities/Tatnikit.entity';
import { IHeader } from '@shared/utils/exporter/types';
import { CrudRequest } from '@dataui/crud';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: Tatnikit,
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
          { value: 'student.tz', label: 'תז תלמידה' },
          { value: 'student.name', label: 'שם תלמידה' },
          { value: 'class.name', label: 'כיתה' },
          { value: 'year', label: 'שנה' },
        ];
      },
    },
  };
}

export default getConfig();
