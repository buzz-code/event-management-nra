import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { SelectionHelper } from "./selection-helper";
import { LevelType } from "src/db/entities/LevelType.entity";

/**
 * Specialized handler for selecting paths/tracks
 * Uses our new SelectionHelper for standardized selection behavior
 */
export class PathSelectionHandler extends SelectionHelper<LevelType> {
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
      dataSource.getRepository(LevelType),
      false, // Don't auto-select
      1 // Single selection
    );
  }

  /**
   * Gets the selected path
   * @returns The selected path/track
   */
  getSelectedPath(): LevelType | null {
    return this.getSelectedItem();
  }

  /**
   * Creates a custom selection prompt for paths
   * @returns The formatted prompt string
   */
  protected createSelectionPrompt(): string {
    let options = this.items.map(item => `להקשת ${item.key} עבור מסלול ${item.name}`).join('\n');
    return `אנא בחרי את המסלול על ידי הקשת המספר המתאים:\n${options}`;
  }
}