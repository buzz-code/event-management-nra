import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { EventGift } from 'src/db/entities/EventGift.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: EventGift,
    query: {
      join: {
        event: { eager: false },
        gift: { eager: true },
      },
    },
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'event.name', label: 'אירוע' },
          { value: 'gift.name', label: 'מתנה' },
          { value: 'year', label: 'שנה' },
        ];
      },
    },
  };
}

export default getConfig();
