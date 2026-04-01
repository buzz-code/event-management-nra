import { FamilyTeacherAssignment } from 'src/db/entities/FamilyTeacherAssignment.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../family-teacher-assignment.config';

createEntityConfigTests('FamilyTeacherAssignmentConfig', config, {
  entity: FamilyTeacherAssignment,
  expectedJoins: {
    user: { eager: false },
    teacher: { eager: false },
  },
  expectedExportHeaders: {
    count: 4,
    first: { value: 'year', label: 'שנה' },
  },
});
