import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource, FindOptionsOrder, Repository } from "typeorm";
import { BaseYemotHandler } from "./base-yemot-handler";

/**
 * Interface for selectable entities that have key, name and optional description
 */
export interface SelectableEntity {
  id: number;
  key: number;
  name: string;
  description?: string;
}

/**
 * Abstract base handler for selection operations (both single and multiple)
 * Contains shared functionality for fetching items, validation, and basic selection flow
 */
export abstract class BaseSelectionHandler<T extends SelectableEntity> extends BaseYemotHandler {
  protected items: T[] = [];
  protected repository: Repository<T>;
  protected entityName: string;

  /**
   * Constructor for the BaseSelectionHandler
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
    super(logger, call, dataSource);
    this.entityName = entityName;
    this.repository = entityRepository;
  }

  /**
   * Fetches all items from the repository
   */
  protected async fetchItems(orderBy: keyof T = 'key' as keyof T): Promise<void> {
    this.logStart('fetchItems');

    this.items = await this.repository.find({
      order: {
        [orderBy]: 'ASC'
      } as FindOptionsOrder<T>
    });

    if (this.items.length === 0) {
      this.logger.warn(`No ${this.entityName} options found in the database`);
    } else {
      this.logger.log(`Found ${this.items.length} ${this.entityName} options`);
    }

    this.logComplete('fetchItems');
  }

  /**
   * Handles the general selection flow
   * This template method defines the overall process flow
   */
  async handleSelection(): Promise<void> {
    this.logStart('handleSelection');

    // First fetch the items
    await this.fetchItems();

    if (this.items.length === 0) {
      await this.hangupWithMessage(`אין אפשרויות ${this.entityName} במערכת כרגע. אנא פנה למנהל המערכת.`);
      return;
    }

    let selectionComplete = false;
    let attempts = 0;

    while (!selectionComplete && attempts < this.maxRetries) {
      try {
        selectionComplete = await this.executeSelectionPrompt();

        if (selectionComplete) {
          // Success! Announce the selection(s)
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
      return;
    }

    this.logComplete('handleSelection');
  }

  /**
   * Abstract method that each subclass must implement to execute the specific selection flow
   * @returns True if selection was successful, false otherwise
   */
  protected abstract executeSelectionPrompt(): Promise<boolean>;

  /**
   * Abstract method that each subclass must implement to announce the selection result
   */
  protected abstract announceSelectionResult(): Promise<void>;

  /**
   * Creates a message prompting the user to select from available items
   * Subclasses may override this to customize the prompt
   */
  protected createSelectionPrompt(): string {
    let prompt = `אנא בחר את ${this.entityName} על ידי הקשת המספר המתאים: `;

    this.items.forEach(item => {
      prompt += `להקשת ${item.key} עבור ${item.name}`;
      if (item.description) {
        prompt += ` - ${item.description}`;
      }
      prompt += ' ';
    });

    return prompt;
  }

  /**
   * Handles selection with existing item(s)
   * Subclasses must override this to handle their specific case
   */
  abstract handleSelectionWithExisting(existingItem: any): Promise<void>;

  /**
   * Find an item by its key
   * @param key The key to search for
   * @returns The found item or null if not found
   */
  protected findItemByKey(key: number): T | null {
    return this.items.find(item => item.key === key) || null;
  }
}