import { Module } from '@nestjs/common';
import { BaseEntityModule } from '@shared/base-entity/base-entity.module';
import { createSharedEntitiesImports } from '@shared/entities/createSharedEntitiesImports';
import userConfig from '@shared/entities/configs/user.config';

import { Student } from './db/entities/Student.entity';
import { Teacher } from './db/entities/Teacher.entity';

// Event Management System entities
import eventConfig from './entity-modules/event.config';
import eventTypeConfig from './entity-modules/event-type.config';
import eventNoteConfig from './entity-modules/event-note.config';
import giftConfig from './entity-modules/gift.config';
import eventGiftConfig from './entity-modules/event-gift.config';
import classConfig from './entity-modules/class.config';
import studentConfig from './entity-modules/student.config';
import teacherConfig from './entity-modules/teacher.config';
import levelTypeConfig from './entity-modules/level-type.config';
import familyStatusTypeConfig from './entity-modules/family-status-type.config';
import studentClassConfig from './entity-modules/student-class.config';
import studentByYearConfig from './entity-modules/student-by-year.config';
import familyConfig from './entity-modules/family.config';
import tatnikitConfig from './entity-modules/tatnikit.config';
import unreportedEventConfig from './entity-modules/unreported-event.config';
import teacherAssignmentRuleConfig from './entity-modules/teacher-assignment-rule.config';
import familyTeacherAssignmentConfig from './entity-modules/family-teacher-assignment.config';
import { createAuditLogConfig } from '@shared/entities/configs/audit-log.config';
import { registerEntityNameMap } from '@shared/entities/configs/import-file.config';

registerEntityNameMap({
  student: 'תלמידות',
  teacher: 'מורות',
  klass: 'כיתות',
  lesson: 'שיעורים',
  att_report: 'דיווחי נוכחות',
  grade: 'ציונים',
});

@Module({
  imports: [
    ...createSharedEntitiesImports(userConfig),

    // Event Management System entities
    BaseEntityModule.register(eventConfig),
    BaseEntityModule.register(eventTypeConfig),
    BaseEntityModule.register(eventNoteConfig),
    BaseEntityModule.register(giftConfig),
    BaseEntityModule.register(eventGiftConfig),
    BaseEntityModule.register(classConfig),
    BaseEntityModule.register(studentConfig),
    BaseEntityModule.register(teacherConfig),
    BaseEntityModule.register(levelTypeConfig),
    BaseEntityModule.register(familyStatusTypeConfig),
    BaseEntityModule.register(studentClassConfig),
    BaseEntityModule.register(studentByYearConfig),
    BaseEntityModule.register(familyConfig),
    BaseEntityModule.register(tatnikitConfig),
    BaseEntityModule.register(unreportedEventConfig),
    BaseEntityModule.register(teacherAssignmentRuleConfig),
    BaseEntityModule.register(familyTeacherAssignmentConfig),

    // Audit log
    BaseEntityModule.register(
      createAuditLogConfig({
        student: Student,
        teacher: Teacher,
      }),
    ),
  ],
})
export class EntitiesModule { }
