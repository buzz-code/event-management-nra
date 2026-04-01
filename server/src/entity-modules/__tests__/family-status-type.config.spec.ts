import { FamilyStatusType } from 'src/db/entities/FamilyStatusType.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../family-status-type.config';

createEntityConfigTests('FamilyStatusTypeConfig', config, {
  entity: FamilyStatusType,
  expectedJoins: {
    students: { eager: false },
  },
  expectedExportHeaders: {
    count: 2,
    first: { value: 'key', label: 'מפתח' },
  },
});
