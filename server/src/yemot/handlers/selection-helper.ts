import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource, FindOptionsOrder, Repository } from "typeorm";
import { BaseYemotHandler } from "../core/base-yemot-handler";
import { CallUtils } from "../utils/call-utils";
import { MESSAGE_CONSTANTS } from "../constants/message-constants";
import { SYSTEM_CONSTANTS } from "../constants/system-constants";

/**
 * Interface for entities that can be selected
 */
export interface SelectableEntity {
  id: number;
  name: string;
  key: number;
}

/**
 * SelectionHelper standardizes selection behavior
 * Supports both single and multiple selection patterns
 */
export class SelectionHelper<T extends SelectableEntity> extends BaseYemotHandler {
  protected entityName: string;
  protected entityRepository?: Repository<T>; // Made optional
  protected items: T[] = [];
  protected selectedItems: T[] = [];
  protected autoSelectSingleItem: boolean = false;
  protected isAutoSelected: boolean = false;
  protected maxSelections: number = 1;
  protected selectionConfirmed: boolean = false;

  /**
   * Constructor for the SelectionHelper
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   * @param entityName The name of the entity type (for logging and messages)
   * @param entityRepository The repository to use for fetching entities
   * @param autoSelectSingleItem Whether to automatically select if there's only one item
   * @param maxSelections Maximum number of items that can be selected (default: 1 for single selection)
   */
  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
    entityName: string,
    entityRepository?: Repository<T>, // Made optional
    autoSelectSingleItem: boolean = false,
    maxSelections: number = 1
  ) {
    super(logger, call, dataSource);
    this.entityName = entityName;
    if (entityRepository) {
      this.entityRepository = entityRepository;
    }
    this.autoSelectSingleItem = autoSelectSingleItem;
    this.maxSelections = maxSelections;
  }

  /**
   * Handles single item selection
   * @returns The selected item or null if selection failed
   */
  async handleSingleSelection(): Promise<T | null> {
    this.logStart('handleSingleSelection');

    // First fetch the items
    await this.fetchItems();

    if (this.items.length === 0) {
      await CallUtils.hangupWithMessage(
        this.call,
        `אין אפשרויות ${this.entityName} במערכת כרגע. אנא פנה למנהל המערכת.`,
        this.logger
      );
      this.logComplete('handleSingleSelection', { status: 'no-items' });
      return null;
    }

    // Auto-select if there's only one item and the option is enabled
    if (this.autoSelectSingleItem && this.items.length === 1) {
      this.selectedItems = [this.items[0]];
      this.isAutoSelected = true;
      this.logger.log(`Auto-selected the only available ${this.entityName}: ${this.selectedItems[0].name} (ID: ${this.selectedItems[0].id})`);
      
      // Announce the auto-selection
      await this.announceAutoSelectionResult();
      
      this.logComplete('handleSingleSelection', { status: 'auto-selected' });
      return this.selectedItems[0];
    }

    // Continue with the regular selection process for multiple items
    let selectionComplete = false;
    let attempts = 0;

    while (!selectionComplete && attempts < SYSTEM_CONSTANTS.MAX_RETRIES) {
      try {
        selectionComplete = await this.executeSelectionPrompt();

        if (selectionComplete) {
          // Success! Announce the selection
          await this.announceSelectionResult();
        } else {
          // Selection wasn't successful, increment attempts
          attempts++;
          if (attempts < SYSTEM_CONSTANTS.MAX_RETRIES) {
            await CallUtils.playMessage(
              this.call,
              MESSAGE_CONSTANTS.GENERAL.INVALID_INPUT,
              this.logger
            );
          }
        }
      } catch (error) {
        this.logError('handleSingleSelection', error as Error);
        attempts++;
        if (attempts < SYSTEM_CONSTANTS.MAX_RETRIES) {
          await CallUtils.playMessage(
            this.call,
            MESSAGE_CONSTANTS.GENERAL.ERROR,
            this.logger
          );
        }
      }
    }

    if (!selectionComplete) {
      this.logger.error(`Maximum ${this.entityName} selection attempts reached`);
      await CallUtils.hangupWithMessage(
        this.call,
        MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED,
        this.logger
      );
      this.logComplete('handleSingleSelection', { status: 'max-attempts-reached' });
      return null;
    }

    this.logComplete('handleSingleSelection', { status: 'manual-selected' });
    return this.selectedItems.length > 0 ? this.selectedItems[0] : null;
  }

  /**
   * Handles multiple item selection
   * @returns The selected items or empty array if selection failed
   */
  async handleMultiSelection(): Promise<T[]> {
    this.logStart('handleMultiSelection');

    // First fetch the items
    await this.fetchItems();

    if (this.items.length === 0) {
      await CallUtils.hangupWithMessage(
        this.call,
        `אין אפשרויות ${this.entityName} במערכת כרגע. אנא פנה למנהל המערכת.`,
        this.logger
      );
      this.logComplete('handleMultiSelection', { status: 'no-items' });
      return [];
    }

    // Clear selection
    this.selectedItems = [];

    // Execute multi-selection
    await this.executeMultiSelectionFlow();

    // Check if the selection was confirmed
    if (!this.selectionConfirmed && this.selectedItems.length > 0) {
      this.logger.warn(`User did not confirm ${this.entityName} selections`);
      this.logComplete('handleMultiSelection', { status: 'not-confirmed' });
    } else {
      this.logComplete('handleMultiSelection', { 
        status: 'completed',
        selectedCount: this.selectedItems.length
      });
    }

    return this.selectedItems;
  }

  /**
   * Executes the multi-selection flow
   * Allows selecting multiple items and confirms the selection
   */
  protected async executeMultiSelectionFlow(): Promise<void> {
    let continueSelection = true;
    let selectionAttempts = 0;
    
    // Loop for selection
    while (continueSelection && this.selectedItems.length < this.maxSelections) {
      if (selectionAttempts >= SYSTEM_CONSTANTS.MAX_RETRIES) {
        this.logger.error(`Maximum ${this.entityName} selection attempts reached`);
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED,
          this.logger
        );
        return;
      }
      
      // Show current selection status
      if (this.selectedItems.length > 0) {
        const selectedNames = this.selectedItems.map(item => item.name).join(", ");
        await CallUtils.playMessage(
          this.call,
          `בחרת ב: ${selectedNames}`,
          this.logger
        );
      }
      
      try {
        // Execute a single selection
        const selectionComplete = await this.executeSelectionPrompt();
        
        if (selectionComplete) {
          selectionAttempts = 0;
          
          // Check if we should continue selecting more items
          if (this.selectedItems.length < this.maxSelections) {
            continueSelection = await CallUtils.getConfirmation(
              this.call,
              `בחרת ב${this.entityName}: ${this.selectedItems[this.selectedItems.length - 1].name}.`,
              this.logger,
              'לבחירה נוספת הקישי 1',
              'לסיום הקישי 2'
            );
          } else {
            await CallUtils.playMessage(
              this.call,
              `הגעת למקסימום של ${this.maxSelections} אפשרויות בחירה`,
              this.logger
            );
            continueSelection = false;
          }
        } else {
          selectionAttempts++;
          await CallUtils.playMessage(
            this.call,
            MESSAGE_CONSTANTS.GENERAL.INVALID_INPUT,
            this.logger
          );
        }
      } catch (error) {
        this.logError('executeMultiSelectionFlow', error as Error);
        selectionAttempts++;
        await CallUtils.playMessage(
          this.call,
          MESSAGE_CONSTANTS.GENERAL.ERROR,
          this.logger
        );
      }
    }
    
    // If we have selected items, confirm the selection
    if (this.selectedItems.length > 0) {
      await this.finalizeMultiSelection();
    }
  }

  /**
   * Finalizes the multi-selection by confirming with the user
   */
  protected async finalizeMultiSelection(): Promise<void> {
    // List all selected items
    const selectedNames = this.selectedItems.map(item => item.name).join(", ");
    await CallUtils.playMessage(
      this.call,
      `בחרת ב: ${selectedNames}`,
      this.logger
    );

    // Warning about final selection
    if (this.entityName === "שובר" || this.entityName === "שוברים") {
      await CallUtils.playMessage(
        this.call,
        MESSAGE_CONSTANTS.VOUCHER.FINAL_WARNING,
        this.logger
      );
    }

    // Confirm selection
    this.selectionConfirmed = await CallUtils.getConfirmation(
      this.call,
      '',
      this.logger,
      'לאישור הבחירה הקישי 1',
      'לבחירה מחדש הקישי 2'
    );

    if (!this.selectionConfirmed) {
      await CallUtils.playMessage(
        this.call,
        this.entityName === "שובר" || this.entityName === "שוברים" 
          ? MESSAGE_CONSTANTS.VOUCHER.RETRY_SELECTION
          : `נחזור לבחירת ה${this.entityName} מההתחלה`,
        this.logger
      );
      
      // Clear selection to start over
      this.selectedItems = [];
      
      // Execute multi-selection flow again
      await this.executeMultiSelectionFlow();
    }
  }

  /**
   * Asks the user to select an item and validates the selection
   * @returns True if selection was successful, false otherwise
   */
  protected async executeSelectionPrompt(): Promise<boolean> {
    this.logStart('executeSelectionPrompt');
    
    // Items are expected to have keys from fetchItems.
    // If a subclass overrides fetchItems and doesn't assign keys,
    // this would be an issue. For now, we assume keys are present.
    const items = this.items;

    const maxDigits = Math.max(...items.map(item => item.key.toString().length));
    const allowedKeys = items.map(item => item.key.toString());

    const prompt = this.createSelectionPrompt();

    const selection = await CallUtils.readDigits(
      this.call,
      prompt,
      this.logger,
      {
        max_digits: maxDigits,
        digits_allowed: allowedKeys
      }
    );

    const selectedKey = parseInt(selection);
    const selectedItem = this.findItemByKey(selectedKey);
    
    if (selectedItem !== null) {
      // For multi-selection, check if item is already selected
      if (this.maxSelections > 1) {
        if (this.isItemSelected(selectedItem)) {
          await CallUtils.playMessage(
            this.call,
            `ה${this.entityName} ${selectedItem.name} כבר נבחר. אנא בחר אפשרות אחרת.`,
            this.logger
          );
          return false;
        }
        
        // Add to selections
        this.selectedItems.push(selectedItem);
      } else {
        // For single selection, replace selection
        this.selectedItems = [selectedItem];
      }
      
      this.logger.log(`User selected ${this.entityName}: ${selectedItem.name} (${selectedItem.key})`);
      return true;
    } else {
      this.logger.warn(`Invalid ${this.entityName} selection: ${selectedKey}`);
      return false;
    }
  }

  /**
   * Creates a prompt for selection options
   * @returns The formatted prompt string
   */
  protected createSelectionPrompt(): string {
    let options = this.items.map(item => `להקשת ${item.key} עבור ${item.name}`).join('\n');
    return `אנא בחר ${this.entityName} על ידי הקשת המספר המתאים:\n${options}`;
  }

  /**
   * Finds an item by its key
   * @param key The key to search for
   * @returns The found item or null if not found
   */
  protected findItemByKey(key: number): T | null {
    return this.items.find(item => item.key === key) || null;
  }

  /**
   * Checks if an item is already selected
   * @param item The item to check
   * @returns Whether the item is already selected
   */
  protected isItemSelected(item: T): boolean {
    return this.selectedItems.some(selected => selected.id === item.id);
  }

  /**
   * Fetches items from the repository
   * Can be overridden by subclasses to customize the query
   */
  protected async fetchItems(): Promise<void> {
    this.logStart('fetchItems');

    if (!this.entityRepository) {
      this.logger.warn(`entityRepository is not set for ${this.entityName}. Subclass should override fetchItems or provide a repository.`);
      this.items = [];
      this.logComplete('fetchItems', { count: 0, status: 'no-repository' });
      return;
    }
    
    // Basic implementation - fetch all items ordered by name
    try {
      this.items = await this.entityRepository.find({
        order: { name: 'ASC' } as FindOptionsOrder<T>, // Type assertion for order
      });
      
      // Assign keys to items (starting from 1)
      // Removed dynamic key assignment. Items are expected to have keys from the database.
      // this.items.forEach((item, index) => {
      //   item.key = index + 1;
      // });
      
      this.logger.log(`Fetched ${this.items.length} ${this.entityName} options`);
      this.logComplete('fetchItems', { count: this.items.length });
    } catch (error) {
      this.logError('fetchItems', error as Error);
      throw error;
    }
  }

  /**
   * Announces the selected item to the user
   */
  protected async announceSelectionResult(): Promise<void> {
    if (this.selectedItems.length === 1) {
      await CallUtils.playMessage(
        this.call,
        `בחרת ב${this.entityName}: ${this.selectedItems[0].name}`,
        this.logger
      );
    } else if (this.selectedItems.length > 1) {
      const selectedNames = this.selectedItems.map(item => item.name).join(", ");
      await CallUtils.playMessage(
        this.call,
        `בחרת ב${this.entityName === 'שובר' ? 'שוברים' : this.entityName}: ${selectedNames}`,
        this.logger
      );
    }
  }

  /**
   * Announces that an item was automatically selected (when there was only one option)
   */
  protected async announceAutoSelectionResult(): Promise<void> {
    if (this.selectedItems.length === 1) {
      await CallUtils.playMessage(
        this.call,
        `מצאנו ${this.entityName} אחד זמין: ${this.selectedItems[0].name}`,
        this.logger
      );
    }
  }

  /**
   * Handles selection with an existing item for editing flows
   * @param existingItem The existing item that may be reused
   */
  async handleSelectionWithExisting(existingItem: T): Promise<T | null> {
    if (existingItem) {
      this.logger.log(`Found existing ${this.entityName}: ${existingItem.name}`);
      await CallUtils.playMessage(
        this.call,
        `ה${this.entityName} הנוכחי הוא: ${existingItem.name}`,
        this.logger
      );
      
      // Ask if they want to change it
      const changeSelection = await CallUtils.getConfirmation(
        this.call,
        `האם ברצונך לשנות את ה${this.entityName}?`,
        this.logger,
        'לשינוי הקישי 1',
        'להשארת הבחירה הנוכחית הקישי 2'
      );
      
      if (!changeSelection) {
        // User chose to keep the existing selection
        this.selectedItems = [existingItem];
        this.logger.log(`User kept existing ${this.entityName}: ${existingItem.name}`);
        return existingItem;
      }
    }

    // If no existing item or user chose to change it, handle normal selection
    return await this.handleSingleSelection();
  }

  /**
   * Gets the selected item (for single selection)
   * @returns The selected item or null if none selected
   */
  getSelectedItem(): T | null {
    return this.selectedItems.length > 0 ? this.selectedItems[0] : null;
  }

  /**
   * Gets all selected items (for multi-selection)
   * @returns Array of selected items
   */
  getSelectedItems(): T[] {
    return this.selectedItems;
  }

  /**
   * Checks if the selection was confirmed (for multi-selection)
   * @returns Whether the selection was confirmed
   */
  isSelectionConfirmed(): boolean {
    return this.selectionConfirmed;
  }

  /**
   * Checks if the item was auto-selected
   * @returns Whether the item was auto-selected
   */
  wasAutoSelected(): boolean {
    return this.isAutoSelected;
  }
}