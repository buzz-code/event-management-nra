import { Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { Event } from "src/db/entities/Event.entity";
import { Student } from "src/db/entities/Student.entity";
import { EventType } from "src/db/entities/EventType.entity";
import { LevelType } from "src/db/entities/LevelType.entity";
import { Gift } from "src/db/entities/Gift.entity";
import { EventGift } from "src/db/entities/EventGift.entity";

/**
 * Handler responsible for saving event data to the database
 * Handles both creation of new events and updates to existing events
 */
export class EventSaverHandler {
  private logger: Logger;
  private dataSource: DataSource;
  private savedEvent: Event | null = null;

  /**
   * Constructor for the EventSaverHandler
   * @param logger Logger instance for logging
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, dataSource: DataSource) {
    this.logger = logger;
    this.dataSource = dataSource;
  }

  /**
   * Creates a new event or updates an existing one
   * @param student The student associated with the event
   * @param eventType The event type
   * @param eventDate The date of the event
   * @param levelType Optional level type (path/track)
   * @param gifts Optional array of selected gifts
   * @param existingEvent Optional existing event to update
   * @returns The saved event
   */
  async saveEvent(
    student: Student,
    eventType: EventType,
    eventDate: Date,
    levelType?: LevelType | null,
    gifts?: Gift[] | null,
    existingEvent?: Event | null
  ): Promise<Event> {
    this.logger.log(`Saving event data for student ${student.id}, type ${eventType.id}, date ${eventDate}`);
    
    // Start a transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    
    try {
      // Create a new event or update an existing one
      const event = existingEvent || new Event();
      
      // Update event properties
      event.studentReferenceId = student.id;
      event.eventTypeReferenceId = eventType.id;
      event.eventDate = eventDate;
      
      // Update level type if provided
      if (levelType) {
        event.levelTypeReferenceId = levelType.id;
      }
      
      // If this is a new event, save it to get an ID
      if (!existingEvent) {
        this.savedEvent = await queryRunner.manager.save(event);
        this.logger.log(`Created new event with ID: ${this.savedEvent.id}`);
      } else {
        // Update the existing event
        this.savedEvent = await queryRunner.manager.save(event);
        this.logger.log(`Updated event with ID: ${this.savedEvent.id}`);
        
        // If gifts are provided, remove existing gifts to replace with new ones
        if (gifts && gifts.length > 0) {
          await queryRunner.manager.delete(EventGift, { eventReferenceId: this.savedEvent.id });
          this.logger.log(`Removed existing gifts for event ${this.savedEvent.id}`);
        }
      }
      
      // Add gifts if provided
      if (gifts && gifts.length > 0 && this.savedEvent) {
        const eventGifts = gifts.map(gift => {
          const eventGift = new EventGift();
          eventGift.eventReferenceId = this.savedEvent!.id;
          eventGift.giftReferenceId = gift.id;
          return eventGift;
        });
        
        await queryRunner.manager.save(EventGift, eventGifts);
        this.logger.log(`Added ${eventGifts.length} gifts to event ${this.savedEvent.id}`);
      }
      
      // Commit the transaction
      await queryRunner.commitTransaction();
      this.logger.log(`Event ${this.savedEvent.id} saved successfully`);
      
      return this.savedEvent;
    } catch (error) {
      // Rollback in case of error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error saving event: ${error.message}`);
      throw error;
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  /**
   * Gets the saved event
   * @returns The saved event
   */
  getSavedEvent(): Event | null {
    return this.savedEvent;
  }
}