import { Tatnikit } from 'src/db/entities/Tatnikit.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../tatnikit.config';

createEntityConfigTests('TatnikitConfig', config, {
  entity: Tatnikit,
  expectedJoins: {
    student: { eager: false },
    class: { eager: false },
  },
  expectedExportJoins: {
    student: { eager: true },
    class: { eager: true },
  },
  expectedExportHeaders: {
    count: 4,
    first: { value: 'student.tz', label: 'תז תלמידה' },
  },
});
