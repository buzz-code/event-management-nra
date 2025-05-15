import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { EventNote } from 'src/db/entities/EventNote.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: EventNote,
    query: {
      join: {
        event: { eager: false },
        author: { eager: false },
      },
    },
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'event.name', label: 'אירוע' },
          { value: 'noteText', label: 'הערה' },
          { value: 'year', label: 'שנה' },
        ];
      },
    },
  };
}

export default getConfig();
