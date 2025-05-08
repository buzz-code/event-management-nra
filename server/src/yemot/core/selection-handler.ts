import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource, Repository } from "typeorm";
import { BaseSelectionHandler, SelectableEntity } from "./base-selection-handler";

/**
 * Handler for single item selection
 * Extends the BaseSelectionHandler with single selection functionality
 */
export class SelectionHandler<T extends SelectableEntity> extends BaseSelectionHandler<T> {
  protected selectedItem: T | null = null;
  protected autoSelectSingleItem: boolean = false;
  protected isAutoSelected: boolean = false;
  
  /**
   * Constructor for the SelectionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   * @param entityName The name of the entity type (for logging and messages)
   * @param entityRepository The repository to use for fetching entities
   * @param autoSelectSingleItem Whether to automatically select if there's only one item
   */
  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
    entityName: string,
    entityRepository: Repository<T>,
    autoSelectSingleItem: boolean = false
  ) {
    super(logger, call, dataSource, entityName, entityRepository);
    this.autoSelectSingleItem = autoSelectSingleItem;
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
   * Announces that an item was automatically selected (when there was only one option)
   * Can be overridden by subclasses to customize the message
   */
  protected async announceAutoSelectionResult(): Promise<void> {
    if (this.selectedItem) {
      await this.playMessage(`מצאנו ${this.entityName} אחד זמין: ${this.selectedItem.name}`);
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

  /**
   * Checks if the item was auto-selected
   * @returns Whether the item was auto-selected
   */
  wasAutoSelected(): boolean {
    return this.isAutoSelected;
  }

  /**
   * Overrides the base handleSelection method to add auto-selection support
   * This template method defines the overall process flow
   */
  async handleSelection(): Promise<void> {
    this.logStart('handleSelection');

    // First fetch the items
    await this.fetchItems();

    if (this.items.length === 0) {
      await this.hangupWithMessage(`אין אפשרויות ${this.entityName} במערכת כרגע. אנא פנה למנהל המערכת.`);
      this.logComplete('handleSelection', { status: 'no-items' });
      return;
    }

    // Auto-select if there's only one item and the option is enabled
    if (this.autoSelectSingleItem && this.items.length === 1) {
      this.selectedItem = this.items[0];
      this.isAutoSelected = true;
      this.logger.log(`Auto-selected the only available ${this.entityName}: ${this.selectedItem.name} (ID: ${this.selectedItem.id})`);
      
      // Announce the auto-selection
      await this.announceAutoSelectionResult();
      
      this.logComplete('handleSelection', { status: 'auto-selected' });
      return;
    }

    // Continue with the regular selection process for multiple items
    let selectionComplete = false;
    let attempts = 0;

    while (!selectionComplete && attempts < this.maxRetries) {
      try {
        selectionComplete = await this.executeSelectionPrompt();

        if (selectionComplete) {
          // Success! Announce the selection
          await this.announceSelectionResult();
        } else {
          // Selection wasn't successful, increment attempts
          attempts++;
          if (attempts < this.maxRetries) {
            await this.playMessage('בחירה לא תקינה, אנא נסה שנית');
          }
        }
      } catch (error) {
        this.logger.error(`Error in selection: ${error.message}`);
        attempts++;
        if (attempts < this.maxRetries) {
          await this.playMessage('אירעה שגיאה, אנא נסה שנית');
        }
      }
    }

    if (!selectionComplete) {
      this.logger.error(`Maximum ${this.entityName} selection attempts reached`);
      await this.hangupWithMessage('מספר נסיונות הבחירה הגיע למקסימום. אנא נסה להתקשר שנית מאוחר יותר.');
      this.logComplete('handleSelection', { status: 'max-attempts-reached' });
      return;
    }

    this.logComplete('handleSelection', { status: 'manual-selected' });
  }
}