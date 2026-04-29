import { Family } from 'src/db/view-entities/Family.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../family.config';

createEntityConfigTests('FamilyConfig', config, {
  entity: Family,
  expectedExportHeaders: {
    count: 7,
    first: { value: 'familyName', label: 'שם משפחה' },
  },
});
