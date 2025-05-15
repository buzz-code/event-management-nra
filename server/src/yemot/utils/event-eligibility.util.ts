import { Event as DBEvent } from 'src/db/entities/Event.entity';

export enum EventEligibilityType {
  PATH = 'PATH',
  VOUCHER = 'VOUCHER',
  POST_UPDATE = 'POST_UPDATE',
  NONE = 'NONE',
}

/**
 * Utility class providing consistent event eligibility checks across the system
 */
export class EventEligibilityUtil {
  /**
   * Check if an event is eligible for path selection
   * Event is eligible if:
   * - No path is selected yet (levelTypeReferenceId is null)
   * - Not yet completed with post-event path (completedPathReferenceId is null)
   */
  static isEligibleForPathSelection(event: DBEvent): boolean {
    return (
      event.levelTypeReferenceId === null &&
      event.completedPathReferenceId === null
    );
  }

  /**
   * Check if an event is eligible for voucher selection
   * Event is eligible if:
   * - Has a path selected (levelTypeReferenceId is not null)
   * - No vouchers selected yet (eventGifts is empty or null)
   */
  static isEligibleForVoucherSelection(event: DBEvent): boolean {
    return (
      event.levelTypeReferenceId !== null &&
      (!event.eventGifts || event.eventGifts.length === 0)
    );
  }

  /**
   * Check if an event is eligible for post-event update
   * Event is eligible if:
   * - Event date is in the past
   * - Not yet completed with post-event path (completedPathReferenceId is null)
   */
  static isEligibleForPostEventUpdate(event: DBEvent): boolean {
    return (
      event.completedPathReferenceId === null && event.eventDate < new Date()
    );
  }

  /**
   * Helper to filter an array of events by eligibility type
   */
  static filterEligibleEvents(
    events: DBEvent[],
    eligibilityCheck: (event: DBEvent) => boolean,
  ): DBEvent[] {
    return events
      .filter(eligibilityCheck)
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime()); // Sort by date ascending
  }
}
