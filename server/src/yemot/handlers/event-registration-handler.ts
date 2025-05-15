import { Logger } from '@nestjs/common';
import { Call } from 'yemot-router2';
import { DataSource, Between } from 'typeorm'; // Removed unused MoreThanOrEqual, LessThanOrEqual, And
import { BaseYemotHandler } from '../core/base-yemot-handler';
import { Student } from 'src/db/entities/Student.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { Event } from 'src/db/entities/Event.entity';
import { CallUtils } from '../utils/call-utils';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';
import {
  DateSelectionHelper,
  DateSelectionResult,
} from './date-selection-helper';
import { FormatUtils } from '../utils/format-utils';
import { VoucherSelectionHandler } from './voucher-selection-handler';
import { Gift } from 'src/db/entities/Gift.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';

/**
 * Interface for event registration results
 */
export interface EventRegistrationResult {
  eventType: EventType;
  date: DateSelectionResult;
  event?: Event;
  vouchers?: Gift[];
}

/**
 * EventRegistrationHandler consolidates event type selection, date selection, and existence checking
 */
export class EventRegistrationHandler extends BaseYemotHandler {
  private student: Student;
  private selectedEventType: EventType | null = null;
  private selectedDate: DateSelectionResult | null = null;
  private selectedVouchers: Gift[] = [];
  private existingEvent: Event | null = null;
  private eventTypes: EventType[] = [];

  /**
   * Constructor for the EventRegistrationHandler
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   * @param student The authenticated student
   */
  constructor(call: Call, dataSource: DataSource, student: Student) {
    super(call, dataSource);
    this.student = student;
  }

  /**
   * Handles the complete event registration flow
   * @returns Event registration result if successful
   */
  async handleEventRegistration(): Promise<EventRegistrationResult | null> {
    this.logStart('handleEventRegistration');

    try {
      // Step 1: Select event type
      await this.selectEventType();
      if (!this.selectedEventType) {
        this.call.logWarn('Event type selection failed');
        return null;
      }

      // Step 2: Select date
      await this.selectDate();
      if (!this.selectedDate) {
        this.call.logWarn('Date selection failed');
        return null;
      }

      // Step 3: Check for existing events
      const eventExists = await this.checkExistingEvent();
      if (eventExists) {
        this.call.logWarn(
          'Event already exists, cannot continue with registration',
        );
        return null;
      }

      // Step 4: Select vouchers
      await this.selectVouchers();
      // We continue even if no vouchers are selected

      // Step 5: Create the event
      const event = await this.createEvent();
      if (!event) {
        this.call.logError('Failed to create event');
        return null;
      }

      this.logComplete('handleEventRegistration', {
        eventTypeId: this.selectedEventType.id,
        dateSelected: this.selectedDate.hebrewDate, // For logging purposes
        eventId: event.id,
        voucherCount: this.selectedVouchers.length,
      });

      return {
        eventType: this.selectedEventType,
        date: this.selectedDate,
        event,
        vouchers: this.selectedVouchers,
      };
    } catch (error) {
      this.logError('handleEventRegistration', error as Error);
      await this.call.hangupWithMessage(MESSAGE_CONSTANTS.EVENT.REPORT_ERROR);
      return null;
    }
  }

  /**
   * Selects the event type
   * Refined error handling to return after hangup instead of throwing.
   */
  private async selectEventType(): Promise<void> {
    this.logStart('selectEventType');

    try {
      // Load all available event types
      // EventType entity does not have 'isActive'. Assuming all are usable.
      // EventType entity does not have 'displayOrder'. Using 'key' for ordering.
      this.eventTypes = await this.dataSource.getRepository(EventType).find({
        order: { key: 'ASC' },
      });

      if (this.eventTypes.length === 0) {
        this.call.logWarn('No event types found in the database.');
        // Inform the user and hang up, then return to stop further execution in this flow.
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.ERROR); // Or a more specific message
        return; // Return after hanging up
      }

      const eventTypeOptions = this.eventTypes
        .map((et, index) => `להקשת ${et.name} הקישי ${index + 1}`)
        .join(', ');

      const selectionMessage =
        MESSAGE_CONSTANTS.EVENT.TYPE_SELECTION_PROMPT(eventTypeOptions);

      const selection = await this.withRetry(
        async () => {
          const input = await this.call.readDigits(selectionMessage, {
            max_digits: 2,
            min_digits: 1,
          });

          const selectionIndex = parseInt(input) - 1;

          if (
            isNaN(selectionIndex) ||
            selectionIndex < 0 ||
            selectionIndex >= this.eventTypes.length
          ) {
            this.call.logWarn(
              `Invalid event type selection index: ${selectionIndex} from input ${input}`,
            );
            throw new Error('Invalid event type selection'); // Caught by withRetry for retry message
          }

          return this.eventTypes[selectionIndex];
        },
        MESSAGE_CONSTANTS.GENERAL.INVALID_INPUT,
        MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED, // Message for final failure of withRetry
      );

      if (!selection) {
        // If withRetry fails and returns null (e.g., max attempts reached), hangup is handled by withRetry.
        // This throw will then be caught by handleEventRegistration's catch block.
        throw new Error('Failed to select event type after retries.');
      }

      this.selectedEventType = selection;

      await this.call.playMessage(
        MESSAGE_CONSTANTS.EVENT.TYPE_SELECTED(this.selectedEventType.name),
      );

      this.logComplete('selectEventType', {
        eventTypeId: this.selectedEventType.id,
      });
    } catch (error) {
      this.logError('selectEventType', error as Error);
      throw error; // Still throw for unexpected errors
    }
  }

  /**
   * Selects the date for the event
   */
  private async selectDate(): Promise<void> {
    this.logStart('selectDate');

    try {
      const dateSelectionHelper = new DateSelectionHelper(
        this.call,
        this.dataSource,
      );
      const dateResult = await dateSelectionHelper.handleDateSelection();

      if (!dateResult) {
        // DateSelectionHelper should handle user messages and hangup on failure/max attempts.
        throw new Error('Date selection failed or was aborted.');
      }

      this.selectedDate = dateResult;

      this.logComplete('selectDate', {
        hebrewDate: this.selectedDate.hebrewDate,
        gregorianDate: this.selectedDate.gregorianDate.toISOString(),
      });
    } catch (error) {
      this.logError('selectDate', error as Error);
      throw error;
    }
  }

  /**
   * Checks if an event with the same type and date already exists for this student
   * @returns True if an event exists, false otherwise
   */
  private async checkExistingEvent(): Promise<boolean> {
    this.logStart('checkExistingEvent');

    if (!this.selectedEventType || !this.selectedDate) {
      this.call.logError(
        'Cannot check existing events: event type or date is missing.',
      );
      throw new Error(
        'Cannot check existing events: event type or date is missing.',
      );
    }

    try {
      const startDate = new Date(this.selectedDate.gregorianDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(this.selectedDate.gregorianDate);
      endDate.setHours(23, 59, 59, 999);

      const foundEvent = await this.dataSource.getRepository(Event).findOne({
        where: {
          studentReferenceId: this.student.id,
          eventTypeReferenceId: this.selectedEventType.id,
          eventDate: Between(startDate, endDate),
        },
      });

      if (foundEvent) {
        this.existingEvent = foundEvent;
        this.call.logWarn(
          `Existing event found: ID ${foundEvent.id} for student ${
            this.student.id
          }, type ${
            this.selectedEventType.id
          }, date ${this.selectedDate.gregorianDate.toISOString()}`,
        );

        const formattedDate = FormatUtils.formatHebrewDate(
          foundEvent.eventDate,
        );

        const message = MESSAGE_CONSTANTS.EVENT.ALREADY_EXISTS(
          this.selectedEventType.name,
          formattedDate,
        );

        await this.call.hangupWithMessage(message);

        this.logComplete('checkExistingEvent', {
          exists: true,
          eventId: foundEvent.id,
        });
        return true;
      }

      this.logComplete('checkExistingEvent', { exists: false });
      return false;
    } catch (error) {
      this.logError('checkExistingEvent', error as Error);
      throw error;
    }
  }

  /**
   * Creates a new event with the selected type and date
   * @returns The created event
   */
  private async createEvent(): Promise<Event> {
    this.logStart('createEvent');

    if (!this.selectedEventType || !this.selectedDate || !this.student) {
      this.call.logError(
        'Cannot create event: event type, date, or student is missing.',
      );
      throw new Error(
        'Cannot create event: event type, date, or student is missing.',
      );
    }

    try {
      const eventRepository = this.dataSource.getRepository(Event);
      const eventGiftRepository = this.dataSource.getRepository(EventGift);

      // Event entity does not have 'hebrewDate' or 'creationDate' (it has 'createdAt' auto-field)
      // A 'name' and 'userId' are required by the Event entity.
      const newEventData: Partial<Event> = {
        studentReferenceId: this.student.id,
        eventTypeReferenceId: this.selectedEventType.id,
        eventDate: this.selectedDate.gregorianDate,
        name: `אירוע ${this.selectedEventType.name} לתלמידה ${
          this.student.name || this.student.tz
        }`, // Example name
        userId: this.student.userId, // Ensure student object has userId
        // Other non-nullable fields from Event entity might need defaults here if not auto-set
      };

      // Start a transaction to ensure both event and vouchers are saved together
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Create and save event within transaction
        const newEvent = eventRepository.create(newEventData);
        const savedEvent = await queryRunner.manager.save(newEvent);
        this.call.logInfo(`New event created: ${savedEvent.id}`);

        // Associate vouchers if any were selected
        if (this.selectedVouchers.length > 0) {
          this.call.logInfo(
            `Associating ${this.selectedVouchers.length} vouchers with event ${savedEvent.id}`,
          );

          for (const voucher of this.selectedVouchers) {
            const eventGift = eventGiftRepository.create({
              eventReferenceId: savedEvent.id,
              giftReferenceId: voucher.id,
              userId: this.student.userId,
            });
            await queryRunner.manager.save(EventGift, eventGift);
          }

          this.call.logInfo(
            `Successfully associated vouchers with event ${savedEvent.id}`,
          );
        }

        // Commit the transaction
        await queryRunner.commitTransaction();

        // // SAVE_SUCCESS message is played here.
        // await this.call.playMessage(MESSAGE_CONSTANTS.EVENT.SAVE_SUCCESS);

        this.logComplete('createEvent', {
          eventId: savedEvent.id,
          voucherCount: this.selectedVouchers.length,
        });
        return savedEvent;
      } catch (error) {
        // Rollback the transaction on error
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        // Release the query runner
        await queryRunner.release();
      }
    } catch (error) {
      this.logError('createEvent', error as Error);
      // Do not play generic error here, let it bubble up to handleEventRegistration
      throw error;
    }
  }

  /**
   * Selects vouchers for the event
   */
  private async selectVouchers(): Promise<void> {
    this.logStart('selectVouchers');

    try {
      // Create and use the voucher selection handler
      const voucherHandler = new VoucherSelectionHandler(
        this.call,
        this.dataSource,
      );

      // Handle the voucher selection - this is multi-selection
      await voucherHandler.handleMultiSelection();
      this.selectedVouchers = voucherHandler.getSelectedVouchers();

      // Confirm the selection
      const selectionConfirmed = voucherHandler.isSelectionConfirmed();

      if (!selectionConfirmed && this.selectedVouchers.length > 0) {
        this.call.logWarn(
          'Voucher selection was not confirmed, clearing selection',
        );
        this.selectedVouchers = [];
      }

      this.logComplete('selectVouchers', {
        selectedVouchersCount: this.selectedVouchers.length,
        selectionConfirmed: selectionConfirmed,
      });
    } catch (error) {
      this.logError('selectVouchers', error as Error);
      this.selectedVouchers = []; // Reset on error
      throw error;
    }
  }

  /**
   * Gets the selected event type
   * @returns The selected event type or null if none was selected
   */
  getSelectedEventType(): EventType | null {
    return this.selectedEventType;
  }

  /**
   * Gets the selected date
   * @returns The selected date information or null if none was selected
   */
  getSelectedDate(): DateSelectionResult | null {
    return this.selectedDate;
  }

  /**
   * Gets the existing event if one was found
   * @returns The existing event or null if none was found
   */
  getExistingEvent(): Event | null {
    return this.existingEvent;
  }

  /**
   * Gets the selected vouchers
   * @returns Array of selected voucher objects
   */
  getSelectedVouchers(): Gift[] {
    return this.selectedVouchers;
  }
}
