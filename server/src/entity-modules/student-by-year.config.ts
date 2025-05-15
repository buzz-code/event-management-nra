import { StudentByYear } from '../db/view-entities/StudentByYear.entity';
import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: StudentByYear,
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'studentTz', label: 'תעודת זהות' },
          { value: 'studentName', label: 'שם תלמיד' },
          { value: 'year', label: 'שנה' },
          { value: 'classNames', label: 'שמות כיתות' },
        ];
      },
    },
  };
}

export default getConfig();
