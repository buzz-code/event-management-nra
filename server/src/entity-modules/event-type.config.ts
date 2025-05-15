import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { EventType } from 'src/db/entities/EventType.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: EventType,
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'key', label: 'מפתח' },
          { value: 'name', label: 'שם' },
          { value: 'description', label: 'תיאור' },
          { value: 'year', label: 'שנה' },
        ];
      },
    },
  };
}

export default getConfig();
