import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { AuthenticationHandler } from "../handlers/authentication-handler";
import { MenuHandler } from "../handlers/menu-handler";
import { EventTypeSelectionHandler } from "../handlers/selection/event-type-handler";
import { LevelTypeSelectionHandler } from "../handlers/selection/level-type-handler";
import { GiftSelectionHandler } from "../handlers/selection/gift-handler";
import { EventExistenceHandler } from "../handlers/event-existence-handler";
import { DateHandler } from "../handlers/date-handler";
import { EventSaverHandler } from "../handlers/event-saver-handler";

/**
 * Factory for creating Yemot handler instances
 * Centralizes handler creation logic and dependency injection
 */
export class YemotHandlerFactory {
  /**
   * Constructor for YemotHandlerFactory
   * @param dataSource The initialized data source
   */
  constructor(private dataSource: DataSource) {}

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
   * Creates a LevelTypeSelectionHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   */
  createLevelTypeHandler(logger: Logger, call: Call): LevelTypeSelectionHandler {
    return new LevelTypeSelectionHandler(logger, call, this.dataSource);
  }

  /**
   * Creates a GiftSelectionHandler instance
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param maxGifts Maximum number of gifts (optional)
   */
  createGiftHandler(
    logger: Logger, 
    call: Call, 
    maxGifts?: number
  ): GiftSelectionHandler {
    return new GiftSelectionHandler(logger, call, this.dataSource, maxGifts);
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
}