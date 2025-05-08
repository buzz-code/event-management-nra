import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { BaseYemotHandler } from "../core/base-yemot-handler";
import { Event } from "src/db/entities/Event.entity";
import { Student } from "src/db/entities/Student.entity";
import { EventType } from "src/db/entities/EventType.entity";

/**
 * Handler for checking if an event already exists
 */
export class EventExistenceHandler extends BaseYemotHandler {
  private existingEvent: Event | null = null;
  private isNewEvent: boolean = true;
  private readonly MODIFICATION_PHONE = "0533152632";

  /**
   * Constructor for the EventExistenceHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, call: Call, dataSource: DataSource) {
    super(logger, call, dataSource);
  }

  /**
   * Checks if an event with the same student, type and date already exists
   * @param student The student associated with the event
   * @param eventType The type of event
   * @param eventDate The date of the event
   * @returns True if this is a new event, false if an existing event was found
   */
  async checkEventExists(student: Student, eventType: EventType, eventDate: Date): Promise<boolean> {
    this.logStart('checkEventExists');
    
    this.logger.log(`Checking if event exists for student ID: ${student.id}, event type: ${eventType.id}, date: ${eventDate}`);

    // Query for existing event with the same student, type, and date
    this.existingEvent = await this.dataSource.getRepository(Event).findOne({
      where: {
        studentReferenceId: student.id,
        eventTypeReferenceId: eventType.id,
        eventDate: eventDate
      },
      relations: ['eventType', 'levelType', 'eventGifts', 'eventGifts.gift']
    });

    if (this.existingEvent) {
      this.isNewEvent = false;
      this.logger.log(`Found existing event ID: ${this.existingEvent.id}`);
      
      // Modified: Inform the user they can't edit an existing event and provide phone number
      const message = `נמצא אירוע קיים מסוג ${eventType.name} בתאריך ${this.formatDateForMessage(eventDate)}. ` +
                      `לא ניתן לערוך אירוע קיים במערכת הטלפונית. ` +
                      `אנא התקשרי למספר ${this.MODIFICATION_PHONE} לביצוע שינויים באירוע קיים.`;
      await this.playMessage(message);
      
      // Return false to indicate this is not a new event
      // The flow orchestrator should handle this appropriately
      return false;
    } else {
      this.isNewEvent = true;
      this.logger.log('No existing event found, will create a new one');
      
      // Inform the user they are creating a new event
      const message = `יצירת אירוע חדש מסוג ${eventType.name} בתאריך ${this.formatDateForMessage(eventDate)}.`;
      await this.playMessage(message);
      
      return true;
    }
  }

  /**
   * Format a date for display in a message
   * @param date The date to format
   * @returns Formatted date string
   */
  private formatDateForMessage(date: Date): string {
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  /**
   * Gets the existing event if one was found
   * @returns The existing event or null if none exists
   */
  getExistingEvent(): Event | null {
    return this.existingEvent;
  }

  /**
   * Indicates whether this is a new event or editing an existing one
   * @returns true if creating a new event, false if editing existing
   */
  getIsNewEvent(): boolean {
    return this.isNewEvent;
  }
}