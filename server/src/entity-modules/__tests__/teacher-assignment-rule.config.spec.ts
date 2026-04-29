import { TeacherAssignmentRule } from 'src/db/entities/TeacherAssignmentRule.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../teacher-assignment-rule.config';

createEntityConfigTests('TeacherAssignmentRuleConfig', config, {
  entity: TeacherAssignmentRule,
  expectedJoins: {
    user: { eager: false },
    teacher: { eager: false },
  },
  expectedExportHeaders: {
    count: 6,
    first: { value: 'year', label: 'שנה' },
  },
});
