import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource, Repository } from "typeorm";
import { BaseSelectionHandler, SelectableEntity } from "./base-selection-handler";

/**
 * Handler for single item selection
 * Extends the BaseSelectionHandler with single selection functionality
 */
export class SingleSelectionHandler<T extends SelectableEntity> extends BaseSelectionHandler<T> {
  protected selectedItem: T | null = null;
  
  /**
   * Constructor for the SingleSelectionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   * @param entityName The name of the entity type (for logging and messages)
   * @param entityRepository The repository to use for fetching entities
   */
  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
    entityName: string,
    entityRepository: Repository<T>
  ) {
    super(logger, call, dataSource, entityName, entityRepository);
  }

  /**
   * Asks the user to select an item and validates the selection
   * @returns True if selection was successful, false otherwise
   */
  protected async executeSelectionPrompt(): Promise<boolean> {
    this.logStart('executeSelectionPrompt');
    
    const maxDigits = Math.max(...this.items.map(item => item.key.toString().length));
    const allowedKeys = this.items.map(item => item.key.toString());

    const prompt = this.createSelectionPrompt();

    const selection = await this.readDigits(prompt, {
      max_digits: maxDigits,
      digits_allowed: allowedKeys
    });

    const selectedKey = parseInt(selection);
    this.selectedItem = this.findItemByKey(selectedKey);
    
    const success = this.selectedItem !== null;
    if (success) {
      this.logger.log(`User selected ${this.entityName}: ${this.selectedItem.name} (${this.selectedItem.key})`);
    } else {
      this.logger.warn(`Invalid ${this.entityName} selection: ${selectedKey}`);
    }
    
    this.logComplete('executeSelectionPrompt', { success, selectedKey });
    return success;
  }

  /**
   * Announces the selected item to the user
   */
  protected async announceSelectionResult(): Promise<void> {
    if (this.selectedItem) {
      await this.playMessage(`בחרת ב${this.entityName}: ${this.selectedItem.name}`);
    }
  }

  /**
   * Handles selection with an existing item for editing flows
   * @param existingItem The existing item that may be reused
   */
  async handleSelectionWithExisting(existingItem: T): Promise<void> {
    if (existingItem) {
      this.logger.log(`Found existing ${this.entityName}: ${existingItem.name}`);
      await this.playMessage(`ה${this.entityName} הנוכחי הוא: ${existingItem.name}`);
      
      // Ask if they want to change it
      const changeSelection = await this.getConfirmation(
        `האם ברצונך לשנות את ה${this.entityName}?`,
        'לשינוי הקישי 1',
        'להשארת הבחירה הנוכחית הקישי 2'
      );
      
      if (!changeSelection) {
        // User chose to keep the existing selection
        this.selectedItem = existingItem;
        this.logger.log(`User kept existing ${this.entityName}: ${existingItem.name}`);
        return;
      }
    }

    // If no existing item or user chose to change it, handle normal selection
    await this.handleSelection();
  }

  /**
   * Gets the selected item
   * @returns The selected item object
   */
  getSelectedItem(): T | null {
    return this.selectedItem;
  }
}