import { StudentByYear } from 'src/db/view-entities/StudentByYear.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../student-by-year.config';

createEntityConfigTests('StudentByYearConfig', config, {
  entity: StudentByYear,
  expectedExportHeaders: {
    count: 4,
    first: { value: 'studentTz', label: 'תעודת זהות' },
  },
});
