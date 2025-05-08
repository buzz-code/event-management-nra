import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { AuthenticationHandler } from "../handlers/authentication-handler";
import { MenuHandler } from "../handlers/menu-handler";
import { EventTypeSelectionHandler } from "../handlers/selection/event-type-handler";
import { PathSelectionHandler } from "../handlers/selection/path-handler";
import { VoucherSelectionHandler } from "../handlers/selection/voucher-handler";
import { EventExistenceHandler } from "../handlers/event-existence-handler";
import { DateHandler } from "../handlers/date-handler";
import { EventSaverHandler } from "../handlers/event-saver-handler";
import { PostEventHandler } from "../handlers/post-event-handler";
import { EventForUpdateSelectionHandler } from "../handlers/selection/event-for-update-selection-handler";

/**
 * Factory for creating Yemot handler instances
 * Centralizes handler creation logic and dependency injection
 */
export class YemotHandlerFactory {
  /**
   * Constructor for YemotHandlerFactory
   * @param dataSource The initialized data source
   */
  constructor(private dataSource: DataSource) { }

  /**
   * Creates an AuthenticationHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createAuthenticationHandler(logger: Logger, call: Call): AuthenticationHandler {
    return new AuthenticationHandler(logger, call, this.dataSource);
  }

  /**
   * Creates a MenuHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createMenuHandler(logger: Logger, call: Call): MenuHandler {
    return new MenuHandler(logger, call, this.dataSource);
  }

  /**
   * Creates an EventTypeSelectionHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createEventTypeHandler(logger: Logger, call: Call): EventTypeSelectionHandler {
    return new EventTypeSelectionHandler(logger, call, this.dataSource);
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
   * Creates an EventExistenceHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createEventExistenceHandler(logger: Logger, call: Call): EventExistenceHandler {
    return new EventExistenceHandler(logger, call, this.dataSource);
  }

  /**
   * Creates a DateHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createDateHandler(logger: Logger, call: Call): DateHandler {
    return new DateHandler(logger, call);
  }

  /**
   * Creates an EventSaverHandler instance
   * @param logger Logger instance for logging
   */
  createEventSaverHandler(logger: Logger): EventSaverHandler {
    return new EventSaverHandler(logger, this.dataSource);
  }

  /**
   * Creates a PostEventHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createPostEventHandler(logger: Logger, call: Call): PostEventHandler {
    const eventSelector = new EventForUpdateSelectionHandler(
      logger,
      call,
      this.dataSource
    );
    const pathSelector = new PathSelectionHandler(
      logger,
      call,
      this.dataSource
    );
    return new PostEventHandler(logger, call, this.dataSource, eventSelector, pathSelector);
  }
  
  /**
   * Legacy method for backward compatibility - creates a PathSelectionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @deprecated Use createPathHandler instead
   */
  createLevelTypeHandler(logger: Logger, call: Call): PathSelectionHandler {
    return this.createPathHandler(logger, call);
  }
  
  /**
   * Legacy method for backward compatibility - creates a VoucherSelectionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param maxVouchers Maximum number of vouchers (optional)
   * @deprecated Use createVoucherHandler instead
   */
  createGiftHandler(
    logger: Logger,
    call: Call,
    maxVouchers?: number
  ): VoucherSelectionHandler {
    return this.createVoucherHandler(logger, call, maxVouchers);
  }
}