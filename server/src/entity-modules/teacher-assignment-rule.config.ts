import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { TeacherAssignmentRule } from 'src/db/entities/TeacherAssignmentRule.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: TeacherAssignmentRule,
    query: {
      join: {
        user: { eager: false },
      },
    },
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'year', label: 'שנה' },
          { value: 'order', label: 'סדר עדיפות' },
          { value: 'gradeLevelKey', label: 'שכבה' },
          { value: 'teacherReferenceIds', label: 'מורות' },
          { value: 'isActive', label: 'פעיל?' },
        ];
      },
    },
  };
}

export default getConfig();
