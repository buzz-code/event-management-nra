import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { Student } from 'src/db/entities/Student.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: Student,
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'tz', label: 'ת.ז.' },
          { value: 'name', label: 'שם מלא' },
          { value: 'address', label: 'כתובת' },
          { value: 'motherName', label: 'שם האם' },
          { value: 'motherContact', label: 'טלפון האם' },
          { value: 'fatherName', label: 'שם האב' },
          { value: 'fatherContact', label: 'טלפון האב' },
          { value: 'motherPreviousName', label: 'שם משפחה קודם של האם' },
        ];
      },
    },
  };
}

export default getConfig();
