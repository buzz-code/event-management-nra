import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { EventPreviousSimcha } from '../db/view-entities/EventPreviousSimcha.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: EventPreviousSimcha,
  };
}

export default getConfig();
