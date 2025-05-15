import { Logger } from '@nestjs/common';
import { Call } from 'yemot-router2';
import { DataSource } from 'typeorm';
import { SelectionHelper } from './selection-helper';
import { LevelType } from 'src/db/entities/LevelType.entity';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';

/**
 * Specialized handler for selecting paths/tracks
 * Uses our new SelectionHelper for standardized selection behavior
 */
export class PathSelectionHandler extends SelectionHelper<LevelType> {
  /**
   * Constructor for the PathSelectionHandler
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(call: Call, dataSource: DataSource) {
    super(
      call,
      dataSource,
      'מסלול',
      dataSource.getRepository(LevelType),
      false, // autoSelectSingleItem: Auto-selection is NOT required for Path selection (only for Event entities). User must explicitly select.
      1, // Single selection
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
    const options = this.items.map((item) => `להקשת ${item.key} עבור מסלול ${item.name}`).join(', ');
    return MESSAGE_CONSTANTS.SELECTION.PATH_SELECTION_PROMPT(options);
  }
}
