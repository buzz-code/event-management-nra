import { Module } from '@nestjs/common';
import { BaseEntityModule } from '@shared/base-entity/base-entity.module';

import auditLogConfig from './entity-modules/audit-log.config';
import importFileConfig from './entity-modules/import-file.config';

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

// Shared entities
import { YemotCall } from '@shared/entities/YemotCall.entity';
import { TextByUser } from '@shared/view-entities/TextByUser.entity';
import { RecievedMail } from '@shared/entities/RecievedMail.entity';
import { Image } from '@shared/entities/Image.entity';
import userConfig from '@shared/entities/configs/user.config';
import pageConfig from '@shared/entities/configs/page.config';
import paymentTrackConfig from '@shared/entities/configs/payment-track.config';
import textConfig from '@shared/entities/configs/text.config';
import mailAddressConfig from '@shared/utils/mail/mail-address.config';

@Module({
  imports: [
    BaseEntityModule.register(userConfig),

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

    // Common entities and utilities
    BaseEntityModule.register(textConfig),
    BaseEntityModule.register(auditLogConfig),
    BaseEntityModule.register(importFileConfig),
    BaseEntityModule.register({ entity: YemotCall }),
    BaseEntityModule.register(mailAddressConfig),
    BaseEntityModule.register({ entity: RecievedMail }),
    BaseEntityModule.register(pageConfig),
    BaseEntityModule.register({ entity: TextByUser }),
    BaseEntityModule.register({ entity: Image }),
    BaseEntityModule.register(paymentTrackConfig),
  ],
})
export class EntitiesModule {}
