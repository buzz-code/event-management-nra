import { Call } from 'yemot-router2';
import { DataSource } from 'typeorm';
import { Event as DBEvent } from 'src/db/entities/Event.entity';

import { EventEligibilityType } from '../utils/event-eligibility.util';

// Import our new consolidated handlers
import { UserInteractionHandler } from './user-interaction-handler';
import { EventRegistrationHandler } from './event-registration-handler';
import { Student } from 'src/db/entities/Student.entity';
import { PathSelectionHandler } from './path-selection-handler';
import { VoucherSelectionHandler } from './voucher-selection-handler';
import { EventPersistenceHandler } from './event-persistence-handler';
import { PostEventUpdateHandler } from './post-event-update-handler';
import { DateSelectionHelper } from './date-selection-helper';
import { EventForUpdateSelector } from './event-for-update-selector';
import { ConfigurableEventSelector } from './configurable-event-selector'; // Changed import

/**
 * Factory for creating Yemot handler instances
 * Uses the new consolidated handlers from our refactoring
 */
export class YemotHandlerFactory {
  /**
   * Constructor for YemotHandlerFactory
   * @param dataSource The initialized data source
   */
  constructor(private dataSource: DataSource, private call: Call) {}

  /**
   * Creates a UserInteractionHandler instance
   * Replaces AuthenticationHandler and MenuHandler
   */
  createUserInteractionHandler(): UserInteractionHandler {
    return new UserInteractionHandler(this.call, this.dataSource);
  }

  /**
   * Creates an EventRegistrationHandler instance
   * Replaces EventTypeHandler, DateHandler, and EventExistenceHandler
   * @param student The authenticated student
   */
  createEventRegistrationHandler(student: Student): EventRegistrationHandler {
    return new EventRegistrationHandler(this.call, this.dataSource, student);
  }

  /**
   * Creates a PathSelectionHandler instance
   */
  createPathHandler(): PathSelectionHandler {
    return new PathSelectionHandler(this.call, this.dataSource);
  }

  /**
   * Creates a VoucherSelectionHandler instance
   * @param maxVouchers Maximum number of vouchers (optional)
   */
  createVoucherHandler(maxVouchers?: number): VoucherSelectionHandler {
    return new VoucherSelectionHandler(this.call, this.dataSource, maxVouchers);
  }

  /**
   * Creates an EventPersistenceHandler instance
   * Replaces EventSaverHandler with extended functionality
   */
  createEventPersistenceHandler(): EventPersistenceHandler {
    return new EventPersistenceHandler(this.call, this.dataSource);
  }

  /**
   * Creates a DateSelectionHelper instance
   * @returns A DateSelectionHelper instance
   */
  createDateSelectionHelper(): DateSelectionHelper {
    return new DateSelectionHelper(this.call, this.dataSource);
  }

  /**
   * Creates a PostEventUpdateHandler instance
   * @returns A PostEventUpdateHandler instance
   */
  createPostEventUpdateHandler(): PostEventUpdateHandler {
    return new PostEventUpdateHandler(this.call, this.dataSource);
  }

  /**
   * Creates an EventForUpdateSelector instance
   * @param student Authenticated student
   * @returns An EventForUpdateSelector instance
   */
  createEventForUpdateSelector(student: Student): EventForUpdateSelector {
    return new EventForUpdateSelector(this.call, this.dataSource, student);
  }

  /**
   * Creates an EventForPathAssignmentSelector instance
   * @param student Authenticated student
   * @returns An EventForPathAssignmentSelector instance
   */
  createEventForPathAssignmentSelector(student: Student, events: DBEvent[]): ConfigurableEventSelector {
    return new ConfigurableEventSelector(this.call, this.dataSource, student, events, EventEligibilityType.PATH, true);
  }

  /**
   * Creates an EventForVoucherAssignmentSelector instance
   * @param student Authenticated student
   * @param events Student's events
   * @returns An EventForVoucherAssignmentSelector instance
   */
  createEventForVoucherAssignmentSelector(student: Student, events: DBEvent[]): ConfigurableEventSelector {
    return new ConfigurableEventSelector(
      this.call,
      this.dataSource,
      student,
      events,
      EventEligibilityType.VOUCHER,
      true,
    );
  }

  /**
   * Creates an EventForPostUpdateSelector instance
   * @param student Authenticated student
   * @param events Student's events
   * @returns An EventForPostUpdateSelector instance
   */
  createEventForPostUpdateSelector(student: Student, events: DBEvent[]): ConfigurableEventSelector {
    return new ConfigurableEventSelector(
      this.call,
      this.dataSource,
      student,
      events,
      EventEligibilityType.POST_UPDATE,
      true,
    );
  }
}
