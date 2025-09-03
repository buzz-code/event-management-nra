import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { Family } from 'src/db/view-entities/Family.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: Family,
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'familyName', label: 'שם משפחה' },
          { value: 'fatherName', label: 'שם האב' },
          { value: 'motherName', label: 'שם האם' },
          { value: 'motherPreviousName', label: 'שם קודם של האם' },
          { value: 'fatherContact', label: 'טלפון האב' },
          { value: 'motherContact', label: 'טלפון האם' },
          { value: 'numberOfDaughters', label: 'מספר בנות' },
        ];
      },
    },
  };
}

export default getConfig();
