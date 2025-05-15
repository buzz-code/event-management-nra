import { Logger } from '@nestjs/common';
import { Call } from 'yemot-router2';
import { DataSource } from 'typeorm';
import { SelectionHelper } from './selection-helper';
import { Gift } from 'src/db/entities/Gift.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';
import { SYSTEM_CONSTANTS } from '../constants/system-constants';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';

/**
 * Specialized handler for selecting vouchers
 * Uses our new SelectionHelper for standardized selection behavior
 */
export class VoucherSelectionHandler extends SelectionHelper<Gift> {
  /**
   * Constructor for the VoucherSelectionHandler
   * @param call The enhanced Yemot call object with data access capabilities
   * @param maxVouchers Maximum number of vouchers that can be selected
   */
  constructor(call: Call, maxVouchers: number = SYSTEM_CONSTANTS.MAX_VOUCHERS) {
    super(
      call,
      'שובר',
      undefined, // Don't pass repository, we'll override fetchItems
      false, // Don't auto-select
      maxVouchers,
    );
  }
  
  /**
   * Override fetchItems to use ExtendedCall's getGifts method
   */
  protected async fetchItems(): Promise<void> {
    this.logStart('fetchItems');
    
    try {
      this.items = await this.call.getGifts();
      this.call.logInfo(`Fetched ${this.items.length} ${this.entityName} options`);
      this.logComplete('fetchItems', { count: this.items.length });
    } catch (error) {
      this.logError('fetchItems', error as Error);
      throw error;
    }
  }

  /**
   * Extracts voucher objects from event voucher relations
   * @param eventGifts The event voucher relations to extract from
   * @returns Array of voucher objects
   */
  extractVouchersFromEventVouchers(eventGifts: EventGift[]): Gift[] {
    return eventGifts
      .filter((eg) => eg.gift) // Filter out any invalid relations
      .map((eg) => eg.gift!);
  }

  /**
   * Handles voucher selection with existing event vouchers
   * @param existingEventGifts The existing event vouchers that may be reused
   */
  async handleVoucherSelectionWithExisting(existingEventGifts: EventGift[] | null): Promise<Gift[]> {
    this.logStart('handleVoucherSelectionWithExisting');

    if (existingEventGifts && existingEventGifts.length > 0) {
      const existingVouchers = this.extractVouchersFromEventVouchers(existingEventGifts);

      const voucherNames = existingVouchers.map((v) => v.name).join(', ');
      this.call.logInfo(`Found existing vouchers: ${voucherNames}`);
      await this.call.playMessage(MESSAGE_CONSTANTS.VOUCHER.CURRENT_VOUCHERS(voucherNames));

      // Ask if they want to change
      const changeSelection = await this.call.getConfirmation(
        MESSAGE_CONSTANTS.VOUCHER.CHANGE_PROMPT,
        MESSAGE_CONSTANTS.VOUCHER.CHANGE_OPTION,
        MESSAGE_CONSTANTS.VOUCHER.KEEP_OPTION,
      );

      if (!changeSelection) {
        // Keep existing vouchers
        this.selectedItems = [...existingVouchers];
        this.selectionConfirmed = true;
        this.logComplete('handleVoucherSelectionWithExisting', {
          keptExisting: true,
        });
        return this.selectedItems;
      }
    }

    // If no existing vouchers or user chose to change, handle normal multi-selection
    const selectedVouchers = await this.handleMultiSelection();
    this.logComplete('handleVoucherSelectionWithExisting', {
      selectedNew: true,
      voucherCount: selectedVouchers.length,
    });
    return selectedVouchers;
  }

  /**
   * Creates a custom selection prompt for vouchers
   * @returns The formatted prompt string
   */
  protected createSelectionPrompt(): string {
    const options = this.items.map((item) => `להקשת ${item.key} עבור שובר ${item.name}`).join(' ');
    return MESSAGE_CONSTANTS.VOUCHER.SELECTION_PROMPT(options);
  }

  /**
   * Gets the selected vouchers
   * @returns Array of selected voucher objects
   */
  getSelectedVouchers(): Gift[] {
    return this.getSelectedItems();
  }
}
