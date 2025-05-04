import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";

// Import EventType entity from the correct path
import { EventType } from "src/db/entities/EventType.entity";

/**
 * Class to handle event type selection operations
 */
export class EventTypeHandler {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  private eventTypes: EventType[] = [];
  private selectedEventType: EventType | null = null;

  /**
   * Constructor for the EventTypeHandler
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
   * Fetches all event types from the database
   */
  private async fetchEventTypes(): Promise<void> {
    this.eventTypes = await this.dataSource.getRepository(EventType).find({
      order: {
        key: 'ASC'
      }
    });

    if (this.eventTypes.length === 0) {
      this.logger.warn('No event types found in the database');
    } else {
      this.logger.log(`Found ${this.eventTypes.length} event types`);
    }
  }

  /**
   * Creates a message prompting the user to select from available event types
   */
  private createEventTypeSelectionPrompt(): string {
    let prompt = 'אנא בחר את סוג האירוע על ידי הקשת המספר המתאים:\n';

    this.eventTypes.forEach(eventType => {
      prompt += `להקשת ${eventType.key} עבור ${eventType.name}`;
      if (eventType.description) {
        prompt += ` - ${eventType.description}`;
      }
      prompt += '\n';
    });

    return prompt;
  }

  /**
   * Asks the user to select an event type and validates the selection
   * @returns The selected event type key
   */
  private async promptForEventTypeSelection(): Promise<number> {
    const maxDigits = Math.max(...this.eventTypes.map(et => et.key.toString().length));
    const allowedKeys = this.eventTypes.map(et => et.key.toString());

    const prompt = this.createEventTypeSelectionPrompt();

    const selection = await this.call.read([{ type: 'text', data: prompt }], 'tap', {
      max_digits: maxDigits,
      digits_allowed: allowedKeys
    });

    return parseInt(selection);
  }

  /**
   * Handles the complete event type selection process
   * Will repeat the question if an invalid selection is made
   */
  async handleEventTypeSelection(): Promise<void> {
    // First fetch the event types
    await this.fetchEventTypes();

    if (this.eventTypes.length === 0) {
      return id_list_message_with_hangup(this.call, 'אין סוגי אירועים במערכת כרגע. אנא פנה למנהל המערכת.');
    }

    let validSelection = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!validSelection && attempts < maxAttempts) {
      const selectedKey = await this.promptForEventTypeSelection();

      // Find the selected event type
      this.selectedEventType = this.eventTypes.find(et => et.key === selectedKey) || null;

      if (this.selectedEventType) {
        this.logger.log(`User selected event type: ${this.selectedEventType.name} (${this.selectedEventType.key})`);
        id_list_message(this.call, `בחרת באירוע מסוג: ${this.selectedEventType.name}`);
        validSelection = true;
      } else {
        // This shouldn't happen due to digits_allowed, but just in case
        this.logger.warn(`Invalid event type selection: ${selectedKey}`);
        id_list_message(this.call, 'בחירה לא תקינה, אנא נסה שנית');
        attempts++;
      }
    }

    if (!validSelection) {
      return id_list_message_with_hangup(this.call, 'מספר נסיונות הבחירה הגיע למקסימום. אנא נסה להתקשר שנית מאוחר יותר.');
    }
  }

  /**
   * Gets the selected event type
   * @returns The selected event type object
   */
  getSelectedEventType(): EventType | null {
    return this.selectedEventType;
  }
}