import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { SelectionHandler } from "../../core/selection-handler";
import { EventType } from "src/db/entities/EventType.entity";

/**
 * Specialized handler for selecting event types
 * Extends the generic SelectionHandler
 */
export class EventTypeSelectionHandler extends SelectionHandler<EventType> {
  /**
   * Constructor for the EventTypeSelectionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, call: Call, dataSource: DataSource) {
    super(
      logger,
      call,
      dataSource,
      'סוג האירוע',
      dataSource.getRepository(EventType)
    );
  }

  /**
   * Gets the selected event type
   * @returns The selected event type
   */
  getSelectedEventType(): EventType | null {
    return this.getSelectedItem();
  }
}