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
  }

  /**
   * Gets the selected gifts
   * @returns Array of selected gift objects
   */
  getSelectedGifts(): Gift[] {
    return this.getSelectedItems();
  }
}