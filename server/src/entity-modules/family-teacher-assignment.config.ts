import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { FamilyTeacherAssignment } from 'src/db/entities/FamilyTeacherAssignment.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: FamilyTeacherAssignment,
    query: {
      join: {
        user: { eager: false },
        teacher: { eager: false },
      },
    },
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'year', label: 'שנה' },
          { value: 'familyReferenceId', label: 'מזהה משפחה' },
          { value: 'teacherReferenceId', label: 'מורה ברירת מחדל' },
          { value: 'historyJson', label: 'היסטוריה' },
        ];
      },
    },
  };
}

export default getConfig();
