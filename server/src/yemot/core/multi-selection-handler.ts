import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource, Repository } from "typeorm";
import { BaseSelectionHandler, SelectableEntity } from "./base-selection-handler";

/**
 * Handler for selecting multiple entities from a list
 * Extends BaseSelectionHandler for multi-selection support
 */
export class MultiSelectionHandler<T extends SelectableEntity> extends BaseSelectionHandler<T> {
  protected selectedItems: T[] = [];
  protected maxSelections: number = 3; // Default max selections
  
  /**
   * Constructor for the MultiSelectionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   * @param entityName The name of the entity type (for logging and messages)
   * @param entityRepository The repository to use for fetching entities
   * @param maxSelections Maximum number of items that can be selected
   */
  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
    entityName: string,
    entityRepository: Repository<T>,
    maxSelections?: number
  ) {
    super(logger, call, dataSource, entityName, entityRepository);
    
    if (maxSelections !== undefined) {
      this.maxSelections = maxSelections;
    }
  }

  /**
   * Starts a fresh multi-selection process
   * For consistency with the base class pattern
   */
  async handleMultiSelection(): Promise<void> {
    this.selectedItems = [];
    await this.handleSelection();
  }

  /**
   * Creates a selection prompt with remaining selections count
   * @param remainingSelections Number of selections remaining
   */
  protected createSelectionPromptWithRemaining(remainingSelections: number): string {
    const selectionText = remainingSelections === this.maxSelections 
      ? `עד ${this.maxSelections} ${this.entityName}` 
      : `עוד ${remainingSelections} ${remainingSelections === 1 ? this.entityName : this.entityName + 'ים'}`;
      
    let prompt = `אנא בחר ${selectionText} על ידי הקשת המספר המתאים:\n`;
    
    // List only items that haven't been selected yet
    this.items.forEach(item => {
      if (!this.selectedItems.some(selected => selected.id === item.id)) {
        prompt += `להקשת ${item.key} עבור ${item.name}`;
        if (item.description) {
          prompt += ` - ${item.description}`;
        }
        prompt += '\n';
      }
    });
    
    prompt += `להקשת 0 לסיום הבחירה`;
    
    return prompt;
  }

  /**
   * Executes the multi-selection process
   * Allows selecting multiple items up to maxSelections or until finished by user
   * @returns True when selection is complete, false if an error occurs
   */
  protected async executeSelectionPrompt(): Promise<boolean> {
    this.logStart('executeSelectionPrompt');
    
    let remainingSelections = this.maxSelections - this.selectedItems.length;
    let finished = false;
    let valid = false;

    try {
      const availableItems = this.items.filter(
        item => !this.selectedItems.some(selected => selected.id === item.id)
      );
      
      if (availableItems.length === 0 && this.selectedItems.length === 0) {
        this.logger.warn('No items available for selection');
        return false;
      }
      
      // All items already selected or no more selections allowed
      if (availableItems.length === 0 || remainingSelections === 0) {
        this.logger.log('All available selections made or max selections reached');
        return true;
      }
      
      const availableKeys = availableItems.map(item => item.key.toString());
      const allowedKeys = ['0', ...availableKeys];
      
      // Find the maximum key length to determine max_digits
      const maxDigits = Math.max(2, Math.max(...this.items.map(item => item.key.toString().length)));

      const prompt = this.createSelectionPromptWithRemaining(remainingSelections);

      const selection = await this.readDigits(prompt, {
        max_digits: maxDigits,
        digits_allowed: allowedKeys
      });
      
      const selectedKey = parseInt(selection);
      
      if (selectedKey === 0) {
        // User chose to finish selection
        finished = true;
        
        // If no items were selected, confirm they want to continue without selections
        if (this.selectedItems.length === 0) {
          const confirmNoSelections = await this.getConfirmation(
            `לא בחרת ${this.entityName}. האם את בטוחה שברצונך להמשיך?`,
            'להמשיך ללא בחירות הקישי 1',
            `לחזרה לבחירת ${this.entityName} הקישי 2`
          );
          
          valid = confirmNoSelections; // Valid only if user confirms no selections
        } else {
          valid = true; // Valid because user has made selections
        }
      } else {
        // Find item by key from available items (not already selected)
        const selectedItem = this.findItemByKey(selectedKey);

        if (selectedItem && !this.selectedItems.some(item => item.id === selectedItem.id)) {
          this.selectedItems.push(selectedItem);
          this.logger.log(`User selected ${this.entityName}: ${selectedItem.name} (${selectedItem.key})`);
          await this.playMessage(`בחרת ב${this.entityName}: ${selectedItem.name}`);
          
          // Check if we've reached max selections or have more to go
          remainingSelections--;
          valid = remainingSelections === 0 || finished; // Valid if max reached or user finished
          
          if (remainingSelections > 0 && !finished) {
            // More selections available, continue selection process
            return await this.executeSelectionPrompt(); // Recursive call
          }
        } else {
          this.logger.warn(`Invalid ${this.entityName} selection: ${selectedKey}`);
          valid = false;
        }
      }
    } catch (error) {
      this.logger.error(`Error in multi-selection process: ${error.message}`);
      return false;
    }
    
    this.logComplete('executeSelectionPrompt', { valid, selectedCount: this.selectedItems.length });
    return valid;
  }

  /**
   * Announces the selected items to the user
   */
  protected async announceSelectionResult(): Promise<void> {
    if (this.selectedItems.length > 0) {
      const itemNames = this.selectedItems.map(item => item.name).join(', ');
      await this.playMessage(
        `ה${this.entityName}ים שבחרת: ${itemNames}`
      );
    } else {
      await this.playMessage(`לא נבחרו ${this.entityName}ים`);
    }
  }

  /**
   * Handles the multi-selection process with existing selections
   * @param existingItems The existing items that may be reused
   */
  async handleSelectionWithExisting(existingItems: T[]): Promise<void> {
    // Reset selected items
    this.selectedItems = [];
    
    // If there are existing items, ask if the user wants to change them
    if (existingItems && existingItems.length > 0) {
      const itemNames = existingItems.map(item => item.name).join(', ');
      
      this.logger.log(`Found existing ${this.entityName}s: ${itemNames}`);
      await this.playMessage(`ה${this.entityName}ים שנבחרו כרגע: ${itemNames}`);
      
      // Ask if they want to change the items
      const changeItems = await this.getConfirmation(
        `האם ברצונך לשנות את בחירת ה${this.entityName}ים?`,
        'לשינוי הקישי 1',
        'להשארת הבחירות הנוכחיות הקישי 2'
      );
      
      if (!changeItems) {
        // User chose to keep the existing items
        this.selectedItems = existingItems;
        this.logger.log(`User kept existing ${this.entityName}s: ${itemNames}`);
        return;
      }
    }

    // If no existing items or user chose to change them, handle normal selection
    await this.handleMultiSelection();
  }

  /**
   * Gets the selected items
   * @returns Array of selected items
   */
  getSelectedItems(): T[] {
    return this.selectedItems;
  }
}