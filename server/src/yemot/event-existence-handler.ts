import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { id_list_message } from "@shared/utils/yemot/yemot-router";
import { Event } from "src/db/entities/Event.entity";
import { Student } from "src/db/entities/Student.entity";
import { EventType } from "src/db/entities/EventType.entity";

/**
 * Class to handle event existence checking operations
 */
export class EventExistenceHandler {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  private existingEvent: Event | null = null;
  private isNewEvent: boolean = true;

  /**
   * Constructor for the EventExistenceHandler
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
   * Checks if an event with the same student, type and date already exists
   * @param student The student associated with the event
   * @param eventType The type of event
   * @param eventDate The date of the event
   */
  async checkEventExists(student: Student, eventType: EventType, eventDate: Date): Promise<void> {
    this.logger.log(`Checking if event exists for student ID: ${student.id}, event type: ${eventType.id}, date: ${eventDate}`);

    // Query for existing event with the same student, type, and date
    this.existingEvent = await this.dataSource.getRepository(Event).findOne({
      where: {
        studentReferenceId: student.id,
        eventTypeReferenceId: eventType.id,
        start_date: eventDate
      },
      relations: ['eventType', 'coursePath', 'eventGifts', 'eventGifts.gift']
    });

    if (this.existingEvent) {
      this.isNewEvent = false;
      this.logger.log(`Found existing event ID: ${this.existingEvent.id}`);
      
      // Inform the user they are editing an existing event
      const message = `נמצא אירוע קיים מסוג ${eventType.name} בתאריך ${this.formatDateForMessage(eventDate)}. ` +
                      `את עומדת לערוך את פרטי האירוע הקיים.`;
      await id_list_message(this.call, message);
    } else {
      this.isNewEvent = true;
      this.logger.log('No existing event found, will create a new one');
      
      // Inform the user they are creating a new event
      const message = `יצירת אירוע חדש מסוג ${eventType.name} בתאריך ${this.formatDateForMessage(eventDate)}.`;
      await id_list_message(this.call, message);
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