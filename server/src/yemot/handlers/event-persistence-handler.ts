import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Event as DBEvent } from 'src/db/entities/Event.entity';
import { Student } from 'src/db/entities/Student.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { LevelType } from 'src/db/entities/LevelType.entity';
import { Gift } from 'src/db/entities/Gift.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';
import { EventNote } from 'src/db/entities/EventNote.entity';
import { BaseYemotHandler } from '../core/base-yemot-handler';
import { Call } from 'yemot-router2';

/**
 * EventPersistenceHandler consolidates all database operations related to events
 * Responsible for creating, updating, and querying events
 */
export class EventPersistenceHandler {
  private call: Call;
  private dataSource: DataSource;
  private savedEvent: DBEvent | null = null;

  /**
   * Constructor for the EventPersistenceHandler
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(call: Call, dataSource: DataSource) {
    this.call = call;
    this.dataSource = dataSource;
  }

  /**
   * Logs the start of an operation
   * @param operation Name of the operation
   */
  private logStart(operation: string): void {
    this.call.logInfo(`Starting EventPersistenceHandler.${operation}`);
  }

  /**
   * Logs the completion of an operation
   * @param operation Name of the operation
   * @param result Optional result information
   */
  private logComplete(operation: string, result?: any): void {
    if (result) {
      this.call.logInfo(`Completed EventPersistenceHandler.${operation}: ${JSON.stringify(result)}`);
    } else {
      this.call.logInfo(`Completed EventPersistenceHandler.${operation}`);
    }
  }

  /**
   * Logs an error that occurred during an operation
   * @param operation Name of the operation
   * @param error The error that occurred
   */
  private logError(operation: string, error: Error): void {
    this.call.logError(`Error in EventPersistenceHandler.${operation}: ${error.message}`, error.stack);
  }

  /**
   * Creates a new event or updates an existing one
   * @param student The student associated with the event
   * @param eventType The event type (optional for updates)
   * @param eventDate The date of the event (optional for updates)
   * @param path Optional path/track (uses LevelType entity)
   * @param vouchers Optional array of selected vouchers (uses Gift entity)
   * @param existingEvent Optional existing event to update
   * @returns The saved event
   */
  async saveEvent(
    student: Student,
    eventType?: EventType | null,
    eventDate?: Date | null,
    path?: LevelType | null,
    vouchers?: Gift[] | null,
    existingEvent?: DBEvent | null,
  ): Promise<DBEvent> {
    this.logStart('saveEvent');

    if (eventType) this.call.logInfo(`Event type: ${eventType.id} - ${eventType.name}`);
    if (eventDate) this.call.logInfo(`Event date: ${eventDate}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = existingEvent || new DBEvent();

      event.userId = this.call.userId;
      event.studentReferenceId = student.id;

      if (eventType) {
        event.eventTypeReferenceId = eventType.id;
      }

      if (eventDate) {
        event.eventDate = eventDate;
      }

      if (path) {
        event.levelTypeReferenceId = path.id;
        this.call.logInfo(`Setting path: ${path.id} - ${path.name}`);
      }

      if (!existingEvent) {
        this.savedEvent = await queryRunner.manager.save(DBEvent, event);
        this.call.logInfo(`Created new event with ID: ${this.savedEvent.id}`);
      } else {
        this.savedEvent = await queryRunner.manager.save(DBEvent, event);
        this.call.logInfo(`Updated event with ID: ${this.savedEvent.id}`);

        if (vouchers && vouchers.length > 0) {
          await queryRunner.manager.delete(EventGift, {
            eventReferenceId: this.savedEvent.id,
          });
          this.call.logInfo(`Removed existing vouchers for event ${this.savedEvent.id}`);
        }
      }

      if (vouchers && vouchers.length > 0 && this.savedEvent) {
        const eventVouchers = vouchers.map((voucher) => {
          const eventGift = new EventGift();
          eventGift.userId = voucher.userId;
          eventGift.eventReferenceId = this.savedEvent!.id;
          eventGift.giftReferenceId = voucher.id;
          return eventGift;
        });

        await queryRunner.manager.save(EventGift, eventVouchers);
        this.call.logInfo(`Added ${eventVouchers.length} vouchers to event ${this.savedEvent.id}`);
      }

      await queryRunner.commitTransaction();
      this.call.logInfo(`Event ${this.savedEvent.id} saved successfully`);

      // Fetch the updated event with all relations
      // Load fresh copy of the saved event with all relations
      const updatedEvent = await queryRunner.manager.getRepository(DBEvent).findOne({
        where: {
          id: this.savedEvent!.id,
        },
        relations: ['eventType', 'levelType', 'eventGifts', 'eventGifts.gift'],
      });

      if (!updatedEvent) {
        throw new Error(`Could not fetch updated event with ID ${this.savedEvent.id}`);
      }

      this.savedEvent = updatedEvent;
      this.logComplete('saveEvent', { eventId: this.savedEvent.id });
      return this.savedEvent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logError('saveEvent', error as Error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Adds a note to an event
   * @param event The event to add a note to
   * @param note The note text
   * @returns The saved event note
   */
  async addEventNote(event: DBEvent, note: string): Promise<EventNote> {
    this.logStart('addEventNote');

    const eventNote = new EventNote();
    eventNote.userId = this.call.userId;
    eventNote.eventReferenceId = event.id;
    eventNote.noteText = note;

    try {
      const savedNote = await this.dataSource.getRepository(EventNote).save(eventNote);
      this.logComplete('addEventNote', {
        eventId: event.id,
        noteId: savedNote.id,
      });
      return savedNote;
    } catch (error) {
      this.logError('addEventNote', error as Error);
      throw error;
    }
  }

  /**
   * Updates an event's completion status
   * @param event The event to update
   * @param completed Whether the event was completed
   * @returns The updated event
   */
  async updateEventCompletion(event: DBEvent, completed: boolean): Promise<DBEvent> {
    this.logStart('updateEventCompletion');

    event.completed = completed;

    try {
      // Save the update
      await this.dataSource.getRepository(DBEvent).save(event);

      // Load fresh copy with relations
      const updatedEvent = await this.dataSource.getRepository(DBEvent).findOne({
        where: { id: event.id },
        relations: ['eventType', 'levelType', 'eventGifts', 'eventGifts.gift'],
      });

      if (!updatedEvent) {
        throw new Error(`Could not fetch updated event with ID ${event.id}`);
      }

      this.logComplete('updateEventCompletion', {
        eventId: event.id,
        completed,
      });
      return updatedEvent;
    } catch (error) {
      this.logError('updateEventCompletion', error as Error);
      throw error;
    }
  }

  /**
   * Finds events for a student
   * @param student The student to find events for
   * @param includeCompleted Whether to include completed events
   * @returns Array of events
   */
  async findStudentEvents(student: Student, includeCompleted?: boolean): Promise<DBEvent[]> {
    this.logStart('findStudentEvents');

    try {
      let queryBuilder = this.dataSource
        .getRepository(DBEvent)
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.eventType', 'eventType')
        .leftJoinAndSelect('event.levelType', 'levelType')
        .leftJoinAndSelect('event.eventGifts', 'eventGift')
        .leftJoinAndSelect('eventGift.gift', 'gift')
        .where('event.studentReferenceId = :studentId', {
          studentId: student.id,
        });

      if (includeCompleted === false) {
        queryBuilder = queryBuilder.andWhere('event.completed = :completed', {
          completed: false,
        });
      } else if (includeCompleted === true) {
        queryBuilder = queryBuilder.andWhere('event.completed = :completed', {
          completed: true,
        });
      }

      const events = await queryBuilder.getMany();
      this.logComplete('findStudentEvents', {
        studentId: student.id,
        count: events.length,
      });
      return events;
    } catch (error) {
      this.logError('findStudentEvents', error as Error);
      throw error;
    }
  }

  /**
   * Finds an event by ID with all relations loaded
   * @param eventId The ID of the event to find
   * @returns The event with all relations or null if not found
   */
  async findEventById(eventId: number): Promise<DBEvent | null> {
    this.logStart('findEventById');

    try {
      const event = await this.dataSource.getRepository(DBEvent).findOne({
        where: { id: eventId },
        relations: ['eventType', 'levelType', 'eventGifts', 'eventGifts.gift', 'student'],
      });

      this.logComplete('findEventById', { eventId, found: !!event });
      return event;
    } catch (error) {
      this.logError('findEventById', error as Error);
      throw error;
    }
  }

  /**
   * Records the completion of an event with a specific path.
   * @param eventToUpdate The event to update.
   * @param completedPath The path (LevelType) that was completed.
   * @returns The updated event.
   */
  async recordEventCompletion(eventToUpdate: DBEvent, completedPath: LevelType): Promise<DBEvent> {
    this.logStart('recordEventCompletion');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const event = await queryRunner.manager.findOneBy(DBEvent, {
        id: eventToUpdate.id,
      });
      if (!event) {
        throw new Error(`Event with ID ${eventToUpdate.id} not found for completion update.`);
      }

      event.completedPathReferenceId = completedPath.id;
      event.completedPathKey = completedPath.key; // Assuming LevelType has a 'key' property
      event.completionReportDate = new Date();
      // event.completed = true; // Consider if this should also be set here explicitly

      this.savedEvent = await queryRunner.manager.save(DBEvent, event);
      await queryRunner.commitTransaction();

      this.logComplete('recordEventCompletion', {
        eventId: this.savedEvent.id,
        pathId: completedPath.id,
        pathName: completedPath.name,
      });
      return this.savedEvent;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logError('recordEventCompletion', error as Error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Gets the saved event from the last operation
   * @returns The saved event
   */
  getSavedEvent(): DBEvent | null {
    return this.savedEvent;
  }
}
