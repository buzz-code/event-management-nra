import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { MultiSelectionHandler } from "../../core/multi-selection-handler";
import { Gift } from "src/db/entities/Gift.entity";
import { EventGift } from "src/db/entities/EventGift.entity";

/**
 * Specialized handler for selecting multiple gifts/vouchers
 * Extends the MultiSelectionHandler for multi-selection support
 */
export class GiftSelectionHandler extends MultiSelectionHandler<Gift> {
  // Track if the user has confirmed their selection with understanding it's final
  private selectionConfirmed: boolean = false;
  
  /**
   * Constructor for the GiftSelectionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   * @param maxGifts Maximum number of gifts that can be selected (default: 3)
   */
  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
    maxGifts: number = 3
  ) {
    super(
      logger,
      call,
      dataSource,
      'שובר',
      dataSource.getRepository(Gift),
      maxGifts
    );
  }

  /**
   * Extracts gift objects from event gift relations
   * @param eventGifts The event gift relations to extract from
   * @returns Array of gift objects
   */
  extractGiftsFromEventGifts(eventGifts: EventGift[]): Gift[] {
    return eventGifts
      .filter(eg => eg.gift) // Filter out any invalid relations
      .map(eg => eg.gift!);
  }

  /**
   * Handles gift selection with existing event gifts
   * @param existingEventGifts The existing event gifts that may be reused
   */
  async handleGiftSelectionWithEventGifts(existingEventGifts: EventGift[] | null): Promise<void> {
    if (existingEventGifts && existingEventGifts.length > 0) {
      const existingGifts = this.extractGiftsFromEventGifts(existingEventGifts);
      await this.handleSelectionWithExisting(existingGifts);
    } else {
      await this.handleMultiSelection();
    }
    
    // After selection is complete, confirm with warning
    await this.confirmSelectionWithWarning();
  }
  
  /**
   * Confirms voucher selection with a warning that it cannot be changed
   * @returns Whether the selection was confirmed
   */
  async confirmSelectionWithWarning(): Promise<boolean> {
    if (this.selectedItems.length === 0) {
      // No vouchers selected, no need to confirm
      return true;
    }
    
    this.logStart('confirmSelectionWithWarning');
    
    // First confirmation of selections
    const selectedVoucherNames = this.selectedItems.map(item => item.name).join(', ');
    const confirmationMessage = `השוברים שבחרת: ${selectedVoucherNames}`;
    const selectionConfirmed = await this.getConfirmation(
      confirmationMessage,
      'לאישור הבחירה הקישי 1',
      'לשינוי הבחירה הקישי 2'
    );
    
    if (!selectionConfirmed) {
      // User wants to change selections
      this.logger.log('User chose to modify voucher selection');
      this.selectedItems = []; // Clear selections
      this.logComplete('confirmSelectionWithWarning', { confirmed: false });
      return false;
    }
    
    // Add final warning that selection cannot be modified after confirmation
    const finalWarningConfirmed = await this.getConfirmation(
      'שים/י לב: לאחר אישור בחירת השוברים, לא ניתן יהיה לשנות את הבחירה!',
      'להמשיך עם הבחירה הנוכחית הקישי 1',
      'לחזור ולשנות את הבחירה הקישי 2'
    );
    
    if (!finalWarningConfirmed) {
      // User wants to change selections after warning
      this.logger.log('User chose to modify voucher selection after warning');
      this.selectedItems = []; // Clear selections
      this.logComplete('confirmSelectionWithWarning', { confirmed: false });
      return false;
    }
    
    // User confirmed with understanding it's final
    this.selectionConfirmed = true;
    this.logComplete('confirmSelectionWithWarning', { confirmed: true });
    return true;
  }
  
  /**
   * Override the handleMultiSelection method to include confirmation step
   */
  async handleMultiSelection(): Promise<void> {
    this.logStart('handleMultiSelection');
    
    let selectionConfirmed = false;
    let attempts = 0;
    const maxAttempts = 3; // Maximum number of selection attempts
    
    while (!selectionConfirmed && attempts < maxAttempts) {
      // Clear previous selections if retrying
      if (attempts > 0) {
        this.selectedItems = [];
      }
      
      // Perform the base multi-selection process
      await super.handleMultiSelection();
      
      // Confirm selection with warning
      selectionConfirmed = await this.confirmSelectionWithWarning();
      
      if (!selectionConfirmed) {
        attempts++;
        await this.playMessage('נחזור לבחירת השוברים מההתחלה');
      }
    }
    
    if (!selectionConfirmed) {
      this.logger.warn('Maximum voucher selection attempts reached without confirmation');
      await this.playMessage('מספר נסיונות בחירת שוברים הגיע למקסימום. אנא נסה שנית מאוחר יותר.');
    }
    
    this.logComplete('handleMultiSelection', { confirmed: selectionConfirmed });
  }

  /**
   * Gets the selected gifts
   * @returns Array of selected gift objects
   */
  getSelectedGifts(): Gift[] {
    return this.getSelectedItems();
  }
  
  /**
   * Checks if the selection was confirmed with understanding it's final
   * @returns Whether the selection is confirmed
   */
  isSelectionConfirmed(): boolean {
    return this.selectionConfirmed;
  }
}