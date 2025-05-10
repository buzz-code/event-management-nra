import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource, Between } from "typeorm"; // Removed unused MoreThanOrEqual, LessThanOrEqual, And
import { BaseYemotHandler } from "../core/base-yemot-handler";
import { Student } from "src/db/entities/Student.entity";
import { EventType } from "src/db/entities/EventType.entity";
import { Event } from "src/db/entities/Event.entity";
import { CallUtils } from "../utils/call-utils";
import { MESSAGE_CONSTANTS } from "../constants/message-constants";
import { DateSelectionHelper, DateSelectionResult } from "./date-selection-helper";
import { FormatUtils } from "../utils/format-utils";

/**
 * Interface for event registration results
 */
export interface EventRegistrationResult {
  eventType: EventType;
  date: DateSelectionResult;
  event?: Event;
}

/**
 * EventRegistrationHandler consolidates event type selection, date selection, and existence checking
 */
export class EventRegistrationHandler extends BaseYemotHandler {
  private student: Student;
  private selectedEventType: EventType | null = null;
  private selectedDate: DateSelectionResult | null = null;
  private existingEvent: Event | null = null;
  private eventTypes: EventType[] = [];

  /**
   * Constructor for the EventRegistrationHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   * @param student The authenticated student
   */
  constructor(logger: Logger, call: Call, dataSource: DataSource, student: Student) {
    super(logger, call, dataSource);
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
        this.logger.warn('Event type selection failed');
        return null;
      }
      
      // Step 2: Select date
      await this.selectDate();
      if (!this.selectedDate) {
        this.logger.warn('Date selection failed');
        return null;
      }
      
      // Step 3: Check for existing events
      const eventExists = await this.checkExistingEvent();
      if (eventExists) {
        this.logger.warn('Event already exists, cannot continue with registration');
        return null;
      }
      
      // Step 4: Create the event
      const event = await this.createEvent();
      if (!event) {
        this.logger.error('Failed to create event');
        return null;
      }
      
      this.logComplete('handleEventRegistration', { 
        eventTypeId: this.selectedEventType.id,
        dateSelected: this.selectedDate.hebrewDate, // For logging purposes
        eventId: event.id
      });
      
      return {
        eventType: this.selectedEventType,
        date: this.selectedDate,
        event
      };
    } catch (error) {
      this.logError('handleEventRegistration', error as Error);
      await CallUtils.hangupWithMessage(
        this.call,
        MESSAGE_CONSTANTS.EVENT.REPORT_ERROR,
        this.logger
      );
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
        order: { key: 'ASC' } 
      });
      
      if (this.eventTypes.length === 0) {
        this.logger.warn('No event types found in the database.');
        // Inform the user and hang up, then return to stop further execution in this flow.
        await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.GENERAL.ERROR, this.logger); // Or a more specific message
        return; // Return after hanging up
      }
      
      const eventTypeOptions = this.eventTypes.map((et, index) => 
        `להקשת ${et.name} הקישי ${index + 1}`
      ).join(', ');
      
      const selectionMessage = `בחרי את סוג האירוע: ${eventTypeOptions}`;
      
      const selection = await this.withRetry(
        async () => {
          const input = await CallUtils.readDigits(
            this.call,
            selectionMessage,
            this.logger,
            { max_digits: 2, min_digits: 1 }
          );
          
          const selectionIndex = parseInt(input) - 1;
          
          if (isNaN(selectionIndex) || selectionIndex < 0 || selectionIndex >= this.eventTypes.length) {
            this.logger.warn(`Invalid event type selection index: ${selectionIndex} from input ${input}`);
            throw new Error('Invalid event type selection'); // Caught by withRetry for retry message
          }
          
          return this.eventTypes[selectionIndex];
        },
        MESSAGE_CONSTANTS.GENERAL.INVALID_INPUT,
        MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED // Message for final failure of withRetry
      );
      
      if (!selection) {
        // If withRetry fails and returns null (e.g., max attempts reached), hangup is handled by withRetry.
        // This throw will then be caught by handleEventRegistration's catch block.
        throw new Error('Failed to select event type after retries.');
      }
      
      this.selectedEventType = selection;
      
      await CallUtils.playMessage(
        this.call, 
        `בחרת באירוע מסוג ${this.selectedEventType.name}`, 
        this.logger
      );
      
      this.logComplete('selectEventType', { eventTypeId: this.selectedEventType.id });
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
      const dateSelectionHelper = new DateSelectionHelper(this.logger, this.call, this.dataSource);
      const dateResult = await dateSelectionHelper.handleDateSelection();
      
      if (!dateResult) {
        // DateSelectionHelper should handle user messages and hangup on failure/max attempts.
        throw new Error('Date selection failed or was aborted.');
      }
      
      this.selectedDate = dateResult;
      
      this.logComplete('selectDate', {
        hebrewDate: this.selectedDate.hebrewDate,
        gregorianDate: this.selectedDate.gregorianDate.toISOString()
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
      this.logger.error('Cannot check existing events: event type or date is missing.');
      throw new Error('Cannot check existing events: event type or date is missing.');
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
          eventDate: Between(startDate, endDate) 
        }
      });
      
      if (foundEvent) {
        this.existingEvent = foundEvent;
        this.logger.warn(`Existing event found: ID ${foundEvent.id} for student ${this.student.id}, type ${this.selectedEventType.id}, date ${this.selectedDate.gregorianDate.toISOString()}`);
        
        const formattedDate = FormatUtils.formatHebrewDate(foundEvent.eventDate);
        
        const message = MESSAGE_CONSTANTS.EVENT.ALREADY_EXISTS(
          this.selectedEventType.name,
          formattedDate
        );
        
        await CallUtils.hangupWithMessage(this.call, message, this.logger);
        
        this.logComplete('checkExistingEvent', { exists: true, eventId: foundEvent.id });
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
      this.logger.error('Cannot create event: event type, date, or student is missing.');
      throw new Error('Cannot create event: event type, date, or student is missing.');
    }
    
    try {
      const eventRepository = this.dataSource.getRepository(Event);
      // Event entity does not have 'hebrewDate' or 'creationDate' (it has 'createdAt' auto-field)
      // A 'name' and 'userId' are required by the Event entity.
      const newEventData: Partial<Event> = {
        studentReferenceId: this.student.id,
        eventTypeReferenceId: this.selectedEventType.id,
        eventDate: this.selectedDate.gregorianDate,
        name: `אירוע ${this.selectedEventType.name} לתלמידה ${this.student.name || this.student.tz}`, // Example name
        userId: this.student.userId, // Ensure student object has userId
        // Other non-nullable fields from Event entity might need defaults here if not auto-set
      };

      const newEvent = eventRepository.create(newEventData);
      
      const savedEvent = await eventRepository.save(newEvent);
      this.logger.log(`New event created: ${savedEvent.id}`);
      
      // SAVE_SUCCESS message is played here.
      await CallUtils.playMessage(
        this.call, 
        MESSAGE_CONSTANTS.EVENT.SAVE_SUCCESS, 
        this.logger
      );
      
      this.logComplete('createEvent', { eventId: savedEvent.id });
      return savedEvent;
    } catch (error) {
      this.logError('createEvent', error as Error);
      // Do not play generic error here, let it bubble up to handleEventRegistration
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
}
