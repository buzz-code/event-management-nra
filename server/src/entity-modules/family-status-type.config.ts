import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { FamilyStatusType } from 'src/db/entities/FamilyStatusType.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: FamilyStatusType,
    query: {
      join: {
        students: { eager: false },
      },
    },
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'key', label: 'מפתח' },
          { value: 'name', label: 'שם סוג מצב משפחתי' },
        ];
      },
    },
  };
}

export default getConfig();
