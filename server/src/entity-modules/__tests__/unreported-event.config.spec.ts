import { UnreportedEvent } from 'src/db/entities/UnreportedEvent.entity';
import { createEntityConfigTests } from '@shared/utils/testing/entity-config-tester';
import config from '../unreported-event.config';

createEntityConfigTests('UnreportedEventConfig', config, {
  entity: UnreportedEvent,
  expectedJoins: {
    student: { eager: false },
    eventType: { eager: false },
    reporterStudent: { eager: false },
    class: { eager: false },
  },
  expectedExportJoins: {
    student: { eager: true },
    eventType: { eager: true },
    reporterStudent: { eager: true },
    class: { eager: true },
  },
  expectedExportHeaders: {
    count: 10,
    first: { value: 'student.tz', label: 'תז תלמידה' },
  },
});
