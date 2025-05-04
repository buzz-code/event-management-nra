import { Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Event } from "src/db/entities/Event.entity";
import { Student } from "src/db/entities/Student.entity";
import { EventType } from "src/db/entities/EventType.entity";
import { LevelType } from "src/db/entities/LevelType.entity";
import { Gift } from "src/db/entities/Gift.entity";
import { EventGift } from "src/db/entities/EventGift.entity";

/**
 * Class to handle event saving operations
 */
export class EventSaver {
  private logger: Logger;
  private dataSource: DataSource;

  /**
   * Constructor for the EventSaver
   * @param logger Logger instance for logging
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, dataSource: DataSource) {
    this.logger = logger;
    this.dataSource = dataSource;
  }

  /**
   * Saves a new event or updates an existing one
   * @param existingEvent The existing event to update, or null to create a new one
   * @param student The student associated with the event
   * @param eventType The type of event
   * @param eventDate The date of the event
   * @param levelType The selected level type
   * @param selectedGifts The selected gifts
   * @returns The saved event
   */
  async saveEvent(
    existingEvent: Event | null,
    student: Student,
    eventType: EventType,
    eventDate: Date,
    levelType: LevelType | null,
    selectedGifts: Gift[]
  ): Promise<Event> {
    let event: Event;
    const isNewEvent = !existingEvent;

    await this.dataSource.transaction(async (manager) => {
      if (isNewEvent) {
        // Create a new event
        event = new Event();
        event.studentReferenceId = student.id;
        event.eventTypeReferenceId = eventType.id;
        event.eventDate = eventDate; // Using the new eventDate field
        event.name = `${eventType.name} - ${student.firstName} ${student.lastName}`; // Using camelCase property names
        event.userId = 1; // Default user ID; this might need to be adjusted
        
        if (levelType) {
          event.levelTypeReferenceId = levelType.id;
        }
        this.logger.log(`Creating new event for student ID: ${student.id}`);
      } else {
        // Update existing event
        event = existingEvent!;
        if (levelType) {
          event.levelTypeReferenceId = levelType.id;
        }
        this.logger.log(`Updating existing event ID: ${event.id}`);

        // Delete existing event gifts to replace them
        if (event.id) {
          await manager.delete(EventGift, { eventReferenceId: event.id });
        }
      }

      // Save the event
      event = await manager.save(Event, event);

      // Add selected gifts to the event
      if (selectedGifts.length > 0) {
        const eventGifts = selectedGifts.map(gift => {
          const eventGift = new EventGift();
          eventGift.eventReferenceId = event.id;
          eventGift.giftReferenceId = gift.id;
          return eventGift;
        });

        await manager.save(EventGift, eventGifts);
        this.logger.log(`Saved ${eventGifts.length} gifts for event ID: ${event.id}`);
      }
    });

    return event;
  }
}