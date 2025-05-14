import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { SelectionHelper } from "./selection-helper";
import { Gift } from "src/db/entities/Gift.entity";
import { EventGift } from "src/db/entities/EventGift.entity";
import { CallUtils } from "../utils/call-utils";
import { SYSTEM_CONSTANTS } from "../constants/system-constants";

/**
 * Specialized handler for selecting vouchers
 * Uses our new SelectionHelper for standardized selection behavior
 */
export class VoucherSelectionHandler extends SelectionHelper<Gift> {
  /**
   * Constructor for the VoucherSelectionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   * @param maxVouchers Maximum number of vouchers that can be selected
   */
  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
    maxVouchers: number = SYSTEM_CONSTANTS.MAX_VOUCHERS
  ) {
    super(
      logger,
      call,
      dataSource,
      'שובר',
      dataSource.getRepository(Gift),
      false, // Don't auto-select
      maxVouchers
    );
  }

  /**
   * Extracts voucher objects from event voucher relations
   * @param eventGifts The event voucher relations to extract from
   * @returns Array of voucher objects
   */
  extractVouchersFromEventVouchers(eventGifts: EventGift[]): Gift[] {
    return eventGifts
      .filter(eg => eg.gift) // Filter out any invalid relations
      .map(eg => eg.gift!);
  }

  /**
   * Handles voucher selection with existing event vouchers
   * @param existingEventGifts The existing event vouchers that may be reused
   */
  async handleVoucherSelectionWithExisting(existingEventGifts: EventGift[] | null): Promise<Gift[]> {
    this.logStart('handleVoucherSelectionWithExisting');
    
    if (existingEventGifts && existingEventGifts.length > 0) {
      const existingVouchers = this.extractVouchersFromEventVouchers(existingEventGifts);
      
      const voucherNames = existingVouchers.map(v => v.name).join(', ');
      this.logger.log(`Found existing vouchers: ${voucherNames}`);
      await CallUtils.playMessage(
        this.call, 
        `השוברים הנוכחיים שלך הם: ${voucherNames}`, 
        this.logger
      );
      
      // Ask if they want to change
      const changeSelection = await CallUtils.getConfirmation(
        this.call,
        "האם ברצונך לשנות את בחירת השוברים?",
        this.logger,
        "לשינוי הבחירה הקישי 1",
        "להשארת הבחירה הנוכחית הקישי 2"
      );
      
      if (!changeSelection) {
        // Keep existing vouchers
        this.selectedItems = [...existingVouchers];
        this.selectionConfirmed = true;
        this.logComplete('handleVoucherSelectionWithExisting', { keptExisting: true });
        return this.selectedItems;
      }
    }
    
    // If no existing vouchers or user chose to change, handle normal multi-selection
    const selectedVouchers = await this.handleMultiSelection();
    this.logComplete('handleVoucherSelectionWithExisting', { 
      selectedNew: true,
      voucherCount: selectedVouchers.length
    });
    return selectedVouchers;
  }

  /**
   * Creates a custom selection prompt for vouchers
   * @returns The formatted prompt string
   */
  protected createSelectionPrompt(): string {
    let options = this.items.map(item => `להקשת ${item.key} עבור שובר ${item.name}`).join(' ');
    return `אנא בחרי שובר על ידי הקשת המספר המתאים: ${options}`;
  }

  /**
   * Gets the selected vouchers
   * @returns Array of selected voucher objects
   */
  getSelectedVouchers(): Gift[] {
    return this.getSelectedItems();
  }
}