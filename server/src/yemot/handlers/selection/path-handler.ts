// filepath: /root/code-server/config/workspace/event-management-nra/server/src/yemot/handlers/selection/path-handler.ts
import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { SelectionHandler } from "../../core/selection-handler";
import { LevelType } from "src/db/entities/LevelType.entity";

/**
 * Specialized handler for selecting paths/tracks
 * Extends the generic SelectionHandler
 */
export class PathSelectionHandler extends SelectionHandler<LevelType> {
  /**
   * Constructor for the PathSelectionHandler
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
   * Gets the selected path
   * @returns The selected path/track
   */
  getSelectedPath(): LevelType | null {
    return this.getSelectedItem();
  }
}