import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { Class } from 'src/db/entities/Class.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: Class,
    query: {
      join: {
        students: { eager: false },
      },
    },
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'key', label: 'מפתח' },
          { value: 'name', label: 'שם' },
          { value: 'gradeLevel', label: 'רמת כיתה' },
        ];
      },
    },
  };
}

export default getConfig();
