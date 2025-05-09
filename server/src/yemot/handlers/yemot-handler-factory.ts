import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";

// Import our new consolidated handlers
import { UserInteractionHandler } from "./user-interaction-handler";
import { EventRegistrationHandler } from "./event-registration-handler";
import { Student } from "src/db/entities/Student.entity";
import { PathSelectionHandler } from "./path-selection-handler";
import { VoucherSelectionHandler } from "./voucher-selection-handler";
import { EventPersistenceHandler } from "./event-persistence-handler";
import { PostEventUpdateHandler } from "./post-event-update-handler";
import { DateSelectionHelper } from "./date-selection-helper";
import { EventForUpdateSelector } from "./event-for-update-selector";
import { ConfigurableEventSelector } from "./configurable-event-selector"; // Changed import

/**
 * Factory for creating Yemot handler instances
 * Uses the new consolidated handlers from our refactoring
 */
export class YemotHandlerFactory {
  /**
   * Constructor for YemotHandlerFactory
   * @param dataSource The initialized data source
   */
  constructor(private dataSource: DataSource) { }

  /**
   * Creates a UserInteractionHandler instance
   * Replaces AuthenticationHandler and MenuHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createUserInteractionHandler(logger: Logger, call: Call): UserInteractionHandler {
    return new UserInteractionHandler(logger, call, this.dataSource);
  }

  /**
   * Creates an EventRegistrationHandler instance
   * Replaces EventTypeHandler, DateHandler, and EventExistenceHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param student The authenticated student
   */
  createEventRegistrationHandler(logger: Logger, call: Call, student: Student): EventRegistrationHandler {
    return new EventRegistrationHandler(logger, call, this.dataSource, student);
  }

  /**
   * Creates a PathSelectionHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createPathHandler(logger: Logger, call: Call): PathSelectionHandler {
    return new PathSelectionHandler(logger, call, this.dataSource);
  }

  /**
   * Creates a VoucherSelectionHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param maxVouchers Maximum number of vouchers (optional)
   */
  createVoucherHandler(
    logger: Logger,
    call: Call,
    maxVouchers?: number
  ): VoucherSelectionHandler {
    return new VoucherSelectionHandler(logger, call, this.dataSource, maxVouchers);
  }

  /**
   * Creates an EventPersistenceHandler instance
   * Replaces EventSaverHandler with extended functionality
   * @param logger Logger instance for logging
   */
  createEventPersistenceHandler(logger: Logger): EventPersistenceHandler {
    return new EventPersistenceHandler(logger, this.dataSource);
  }

  /**
   * Creates a DateSelectionHelper instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @returns A DateSelectionHelper instance
   */
  createDateSelectionHelper(logger: Logger, call: Call): DateSelectionHelper {
    return new DateSelectionHelper(logger, call, this.dataSource);
  }

  /**
   * Creates a PostEventUpdateHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createPostEventUpdateHandler(logger: Logger, call: Call): PostEventUpdateHandler {
    return new PostEventUpdateHandler(logger, call, this.dataSource);
  }

  /**
   * Creates an EventForUpdateSelector instance
   * @param logger Logger instance
   * @param call Yemot call object
   * @param student Authenticated student
   * @returns An EventForUpdateSelector instance
   */
  createEventForUpdateSelector(logger: Logger, call: Call, student: Student): EventForUpdateSelector {
    return new EventForUpdateSelector(logger, call, this.dataSource, student);
  }

  /**
   * Creates an EventForPathAssignmentSelector instance
   * @param logger Logger instance
   * @param call Yemot call object
   * @param student Authenticated student
   * @returns An EventForPathAssignmentSelector instance
   */
  createEventForPathAssignmentSelector(logger: Logger, call: Call, student: Student): ConfigurableEventSelector {
    return new ConfigurableEventSelector(logger, call, this.dataSource, student);
  }

  /**
   * Creates an EventForVoucherAssignmentSelector instance
   * @param logger Logger instance
   * @param call Yemot call object
   * @param student Authenticated student
   * @returns An EventForVoucherAssignmentSelector instance
   */
  createEventForVoucherAssignmentSelector(logger: Logger, call: Call, student: Student): ConfigurableEventSelector {
    return new ConfigurableEventSelector(logger, call, this.dataSource, student);
  }
}