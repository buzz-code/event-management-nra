import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";

// Import Gift entity from the correct path
import { Gift } from "src/db/entities/Gift.entity";
import { EventGift } from "src/db/entities/EventGift.entity";

/**
 * Class to handle gift selection operations
 */
export class GiftHandler {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  private gifts: Gift[] = [];
  private selectedGifts: Gift[] = [];
  private MAX_GIFTS = 3;

  /**
   * Constructor for the GiftHandler
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
   * Fetches all gifts from the database
   */
  private async fetchGifts(): Promise<void> {
    this.gifts = await this.dataSource.getRepository(Gift).find({
      order: {
        key: 'ASC'
      }
    });

    if (this.gifts.length === 0) {
      this.logger.warn('No active gifts found in the database');
    } else {
      this.logger.log(`Found ${this.gifts.length} active gifts`);
    }
  }

  /**
   * Creates a message prompting the user to select from available gifts
   */
  private createGiftSelectionPrompt(remainingSelections: number): string {
    let prompt = `אנא בחרי ${
      remainingSelections === this.MAX_GIFTS ? 'עד שלוש מתנות' : `עוד ${remainingSelections} ${remainingSelections === 1 ? 'מתנה' : 'מתנות'}`
    } על ידי הקשת המספר המתאים:\n`;
    
    this.gifts.forEach(gift => {
      // Skip already selected gifts
      if (!this.selectedGifts.some(selectedGift => selectedGift.id === gift.id)) {
        prompt += `להקשת ${gift.key} עבור ${gift.name}`;
        if (gift.description) {
          prompt += ` - ${gift.description}`;
        }
        prompt += '\n';
      }
    });
    
    prompt += `להקשת 0 לסיום הבחירה`;
    
    return prompt;
  }

  /**
   * Asks the user to select a gift and validates the selection
   * @param remainingSelections Number of selections remaining
   * @returns The selected gift key or 0 to finish selection
   */
  private async promptForGiftSelection(remainingSelections: number): Promise<number> {
    const availableGiftKeys = this.gifts
      .filter(gift => !this.selectedGifts.some(selectedGift => selectedGift.id === gift.id))
      .map(gift => gift.key.toString());
      
    // Add 0 as a valid option to finish selection
    const allowedKeys = ['0', ...availableGiftKeys];
    
    // Find the maximum key length to determine max_digits
    const maxDigits = Math.max(2, Math.max(...this.gifts.map(gift => gift.key.toString().length)));

    const prompt = this.createGiftSelectionPrompt(remainingSelections);

    const selection = await this.call.read([{ type: 'text', data: prompt }], 'tap', {
      max_digits: maxDigits,
      digits_allowed: allowedKeys
    });

    return parseInt(selection);
  }

  /**
   * Handles the complete gift selection process
   * Allows selection of up to 3 gifts
   */
  async handleGiftSelection(): Promise<void> {
    // First fetch the gifts
    await this.fetchGifts();

    if (this.gifts.length === 0) {
      id_list_message(this.call, 'אין מתנות פעילות במערכת כרגע.');
      return;
    }

    this.selectedGifts = [];
    let remainingSelections = this.MAX_GIFTS;
    let finished = false;

    while (remainingSelections > 0 && !finished) {
      const selectedKey = await this.promptForGiftSelection(remainingSelections);
      
      if (selectedKey === 0) {
        // User chose to finish selection
        finished = true;
        
        if (this.selectedGifts.length === 0) {
          const confirm = await this.call.read([
            { type: 'text', data: 'לא בחרת מתנות. האם את בטוחה שברצונך להמשיך ללא מתנות? הקישי 1 לאישור או 2 לחזרה לבחירת מתנות.' }
          ], 'tap', {
            max_digits: 1,
            digits_allowed: ['1', '2']
          });
          
          if (confirm === '2') {
            // User chose to go back to gift selection
            finished = false;
          }
        }
      } else {
        // Find gift by key
        const selectedGift = this.gifts.find(
          gift => gift.key === selectedKey && 
                 !this.selectedGifts.some(sg => sg.id === gift.id)
        ) || null;

        if (selectedGift) {
          this.selectedGifts.push(selectedGift);
          this.logger.log(`User selected gift: ${selectedGift.name} (${selectedGift.key})`);
          id_list_message(this.call, `בחרת במתנה: ${selectedGift.name}`);
          remainingSelections--;
        } else {
          // This shouldn't happen due to digits_allowed, but just in case
          this.logger.warn(`Invalid gift selection: ${selectedKey}`);
          id_list_message(this.call, 'בחירה לא תקינה, אנא נסי שנית');
        }
      }
    }

    // Summarize selected gifts
    if (this.selectedGifts.length > 0) {
      const giftNames = this.selectedGifts.map(gift => gift.name).join(', ');
      id_list_message(
        this.call, 
        `המתנות שבחרת: ${giftNames}`
      );
    } else {
      id_list_message(this.call, 'לא נבחרו מתנות');
    }
  }

  /**
   * Extracts gift objects from event gift relations
   * @param eventGifts The event gift relations to extract from
   * @returns Array of gift objects
   */
  private extractGiftsFromEventGifts(eventGifts: EventGift[]): Gift[] {
    return eventGifts
      .filter(eg => eg.gift) // Filter out any invalid relations
      .map(eg => eg.gift!);
  }

  /**
   * Handles the gift selection process with existing gifts
   * @param existingEventGifts The existing event gifts that may be reused
   */
  async handleGiftSelectionWithExisting(existingEventGifts: EventGift[] | null | undefined): Promise<void> {
    // Reset selected gifts
    this.selectedGifts = [];
    
    // If there are existing gifts, ask if the user wants to change them
    if (existingEventGifts && existingEventGifts.length > 0) {
      const existingGifts = this.extractGiftsFromEventGifts(existingEventGifts);
      const giftNames = existingGifts.map(gift => gift.name).join(', ');
      
      this.logger.log(`Found existing gifts: ${giftNames}`);
      id_list_message(this.call, `המתנות שנבחרו כרגע: ${giftNames}`);
      
      // Ask if they want to change the gifts
      const changeGifts = await this.call.read([
        { type: 'text', data: 'האם ברצונך לשנות את בחירת המתנות? הקישי 1 לאישור או 2 להשארת המתנות הנוכחיות.' }
      ], 'tap', {
        max_digits: 1,
        digits_allowed: ['1', '2']
      });
      
      if (changeGifts === '2') {
        // User chose to keep the existing gifts
        this.selectedGifts = existingGifts;
        this.logger.log(`User kept existing gifts: ${giftNames}`);
        return;
      }
      // If we get here, user wants to select new gifts
    }

    // If no existing gifts or user chose to change them, handle normal selection
    await this.handleGiftSelection();
  }

  /**
   * Gets the selected gifts
   * @returns Array of selected gift objects
   */
  getSelectedGifts(): Gift[] {
    return this.selectedGifts;
  }
}