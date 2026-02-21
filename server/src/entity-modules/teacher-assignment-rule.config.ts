import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { TeacherAssignmentRule } from 'src/db/entities/TeacherAssignmentRule.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: TeacherAssignmentRule,
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
          { value: 'teacherReferenceId', label: 'מורה' },
          { value: 'classRulesJson', label: 'כללי כיתה' },
          { value: 'gradeRulesJson', label: 'כללי שכבה' },
          { value: 'customRatio', label: 'יחס מותאם' },
          { value: 'isActive', label: 'פעיל?' },
        ];
      },
    },
  };
}

export default getConfig();
