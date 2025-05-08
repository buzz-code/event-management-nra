import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { SelectionHandler } from "../../core/selection-handler";
import { LevelType } from "src/db/entities/LevelType.entity";

/**
 * Specialized handler for selecting level types (paths/tracks)
 * Extends the generic SelectionHandler
 */
export class LevelTypeSelectionHandler extends SelectionHandler<LevelType> {
  /**
   * Constructor for the LevelTypeSelectionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, call: Call, dataSource: DataSource) {
    super(
      logger,
      call,
      dataSource,
      'מסלול',
      dataSource.getRepository(LevelType)
    );
  }

  /**
   * Gets the selected level type
   * @returns The selected level type
   */
  getSelectedLevelType(): LevelType | null {
    return this.getSelectedItem();
  }
}