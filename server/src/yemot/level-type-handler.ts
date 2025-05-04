// filepath: /root/code-server/config/workspace/event-management-nra/server/src/yemot/level-type-handler.ts
import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";

// Import LevelType entity from the correct path
import { LevelType } from "src/db/entities/LevelType.entity";

/**
 * Class to handle level type selection operations
 */
export class LevelTypeHandler {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  private levelTypes: LevelType[] = [];
  private selectedLevelType: LevelType | null = null;

  /**
   * Constructor for the LevelTypeHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, call: Call, dataSource: DataSource) {
    this.logger = logger;
    this.call = call;
    this.dataSource = dataSource;
  }

  /**
   * Fetches all level types from the database
   */
  private async fetchLevelTypes(): Promise<void> {
    this.levelTypes = await this.dataSource.getRepository(LevelType).find({
      order: {
        key: 'ASC'
      }
    });

    if (this.levelTypes.length === 0) {
      this.logger.warn('No level types found in the database');
    } else {
      this.logger.log(`Found ${this.levelTypes.length} level types`);
    }
  }

  /**
   * Creates a message prompting the user to select from available level types
   */
  private createLevelTypeSelectionPrompt(): string {
    let prompt = 'אנא בחר את סוג הרמה על ידי הקשת המספר המתאים:\n';

    this.levelTypes.forEach(type => {
      prompt += `להקשת ${type.key} עבור ${type.name}`;
      if (type.description) {
        prompt += ` - ${type.description}`;
      }
      prompt += '\n';
    });

    return prompt;
  }

  /**
   * Asks the user to select a level type and validates the selection
   * @returns The selected level type key
   */
  private async promptForLevelTypeSelection(): Promise<number> {
    const maxDigits = Math.max(...this.levelTypes.map(type => type.key.toString().length));
    const allowedKeys = this.levelTypes.map(type => type.key.toString());

    const prompt = this.createLevelTypeSelectionPrompt();

    const selection = await this.call.read([{ type: 'text', data: prompt }], 'tap', {
      max_digits: maxDigits,
      digits_allowed: allowedKeys
    });

    return parseInt(selection);
  }

  /**
   * Handles the level type selection process with an existing type
   * @param existingLevelType The existing level type that may be reused
   */
  async handleLevelTypeSelectionWithExisting(existingLevelType: LevelType | null): Promise<void> {
    // If there's an existing level type, ask if the user wants to change it
    if (existingLevelType) {
      this.logger.log(`Found existing level type: ${existingLevelType.name}`);
      id_list_message(this.call, `סוג הרמה הנוכחי הוא: ${existingLevelType.name}`);
      
      // Ask if they want to change it
      const changeLevelType = await this.call.read([
        { type: 'text', data: 'האם ברצונך לשנות את סוג הרמה? הקישי 1 לאישור או 2 להשארת הסוג הנוכחי.' }
      ], 'tap', {
        max_digits: 1,
        digits_allowed: ['1', '2']
      });
      
      if (changeLevelType === '2') {
        // User chose to keep the existing level type
        this.selectedLevelType = existingLevelType;
        this.logger.log(`User kept existing level type: ${existingLevelType.name}`);
        return;
      }
      // If we get here, user wants to select a new level type
    }

    // If no existing level type or user chose to change it, handle normal selection
    await this.handleLevelTypeSelection();
  }

  /**
   * Handles the complete level type selection process
   * Will repeat the question if an invalid selection is made
   */
  async handleLevelTypeSelection(): Promise<void> {
    // First fetch the level types
    await this.fetchLevelTypes();

    if (this.levelTypes.length === 0) {
      return id_list_message_with_hangup(this.call, 'אין סוגי רמה במערכת כרגע. אנא פני למנהל המערכת.');
    }

    let validSelection = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!validSelection && attempts < maxAttempts) {
      const selectedKey = await this.promptForLevelTypeSelection();

      // Find the selected level type
      this.selectedLevelType = this.levelTypes.find(type => type.key === selectedKey) || null;

      if (this.selectedLevelType) {
        this.logger.log(`User selected level type: ${this.selectedLevelType.name} (${this.selectedLevelType.key})`);
        id_list_message(this.call, `בחרת בסוג רמה: ${this.selectedLevelType.name}`);
        validSelection = true;
      } else {
        // This shouldn't happen due to digits_allowed, but just in case
        this.logger.warn(`Invalid level type selection: ${selectedKey}`);
        id_list_message(this.call, 'בחירה לא תקינה, אנא נסי שנית');
        attempts++;
      }
    }

    if (!validSelection) {
      this.logger.error('Maximum level type selection attempts reached');
      return id_list_message_with_hangup(this.call, 'מספר נסיונות הבחירה הגיע למקסימום. אנא נסי להתקשר שנית מאוחר יותר.');
    }
  }

  /**
   * Gets the selected level type
   * @returns The selected level type object
   */
  getSelectedLevelType(): LevelType | null {
    return this.selectedLevelType;
  }
}