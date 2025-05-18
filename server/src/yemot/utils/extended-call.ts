import { DataSource, Between } from 'typeorm';
import { Call } from 'yemot-router2';
import { Logger } from '@nestjs/common';
import { Student } from 'src/db/entities/Student.entity';
import { Event as DBEvent } from 'src/db/entities/Event.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { EventNote } from 'src/db/entities/EventNote.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';
import { Gift } from 'src/db/entities/Gift.entity';
import { LevelType } from 'src/db/entities/LevelType.entity';

// Domain-specific extended Call interface
declare module 'yemot-router2' {
  interface Call {
    // Domain-specific data access methods
    findStudentByTzAndUserId(tz: string): Promise<Student | null>;
    getStudentEvents(studentId?: number): Promise<DBEvent[]>;
    getEventTypes(): Promise<EventType[]>;
    getLevelTypes(): Promise<LevelType[]>;
    getEventById(eventId: number): Promise<DBEvent | null>;
    findEventByDateRange(studentId: number, eventTypeId: number, startDate: Date, endDate: Date): Promise<DBEvent | null>;
    saveEvent(event: Partial<DBEvent>): Promise<DBEvent>;
    updateEvent(event: Partial<DBEvent>): Promise<DBEvent>;
    getGifts(): Promise<Gift[]>;
    getEventGifts(eventId: number): Promise<EventGift[]>;
    saveEventGift(eventGift: Partial<EventGift>): Promise<EventGift>;
    saveEventNote(eventNote: Partial<EventNote>): Promise<EventNote>;
  }
}

/**
 * Factory function that creates an ExtendedCall with domain-specific functionality
 * This builds on top of the base extended call
 */
export function createExtendedCall(call: Call): Call {
  // The call should already have base functionality from the router
  // Just use it directly and add domain-specific functionality on top
  const extendedCall = call;
  const dataSource = call.getDataSource();

  // Entity data access methods specific to the event management domain
  extendedCall.findStudentByTzAndUserId = async function (tz: string): Promise<Student | null> {
    if (!extendedCall.userId) {
      const user = await extendedCall.findUserByPhone();
      if (!user) {
        extendedCall.logError('Cannot find student: User not found');
        return null;
      }
    }

    extendedCall.logInfo(`Finding student for userId: ${extendedCall.userId} and TZ: ${tz}`);
    const studentRepository = dataSource.getRepository(Student);

    const student = await studentRepository.findOne({
      where: {
        userId: extendedCall.userId,
        tz: tz
      },
    });

    if (student) {
      extendedCall.logInfo(`Student found: ${student.id} (${student.name})`);
      extendedCall.setContext('student', student);
    } else {
      extendedCall.logError(`Student not found for userId: ${extendedCall.userId} and TZ: ${tz}`);
    }

    return student;
  };

  extendedCall.getStudentEvents = async function (studentId?: number): Promise<DBEvent[]> {
    const student = studentId
      ? { id: studentId }
      : extendedCall.getContext<Student>('student');

    if (!student) {
      extendedCall.logWarn('Student not found in context, cannot get events');
      return [];
    }

    const targetStudentId = studentId || student.id;
    extendedCall.logInfo(`Getting events for student: ${targetStudentId}`);

    const eventRepository = dataSource.getRepository(DBEvent);
    const events = await eventRepository.find({
      where: { studentReferenceId: targetStudentId },
      relations: ['eventType', 'eventNotes', 'eventGifts', 'eventGifts.gift']
    });

    extendedCall.logInfo(`Found ${events.length} events for student ${targetStudentId}`);
    extendedCall.setContext('events', events);

    return events;
  };

  extendedCall.getEventTypes = async function (): Promise<EventType[]> {
    extendedCall.logInfo('Getting event types');
    const eventTypeRepository = dataSource.getRepository(EventType);
    const eventTypes = await eventTypeRepository.find({
      where: { userId: extendedCall.userId },
      order: { key: 'ASC' }
    });
    extendedCall.setContext('eventTypes', eventTypes);
    return eventTypes;
  };

  extendedCall.getLevelTypes = async function (): Promise<LevelType[]> {
    extendedCall.logInfo('Getting level types (paths)');
    const levelTypeRepository = dataSource.getRepository(LevelType);
    const levelTypes = await levelTypeRepository.find({
      where: { userId: extendedCall.userId },
      order: { key: 'ASC' }
    });
    extendedCall.setContext('levelTypes', levelTypes);
    return levelTypes;
  };

  extendedCall.getEventById = async function (eventId: number): Promise<DBEvent | null> {
    extendedCall.logInfo(`Getting event by ID: ${eventId}`);
    const eventRepository = dataSource.getRepository(DBEvent);
    const event = await eventRepository.findOne({
      where: { id: eventId },
      relations: ['eventType', 'eventNotes', 'eventGifts', 'eventGifts.gift']
    });

    if (event) {
      extendedCall.setContext('currentEvent', event);
    }

    return event;
  };

  extendedCall.findEventByDateRange = async function (
    studentId: number,
    eventTypeId: number,
    startDate: Date,
    endDate: Date
  ): Promise<DBEvent | null> {
    extendedCall.logInfo(`Finding event for student ${studentId}, event type ${eventTypeId}, date range ${startDate} - ${endDate}`);
    const eventRepository = dataSource.getRepository(DBEvent);
    const event = await eventRepository.findOne({
      where: {
        userId: extendedCall.userId,
        studentReferenceId: studentId,
        eventTypeReferenceId: eventTypeId,
        eventDate: Between(startDate, endDate),
      },
    });
    return event;
  };

  extendedCall.saveEvent = async function (event: Partial<DBEvent>): Promise<DBEvent> {
    extendedCall.logInfo(`Saving event: ${JSON.stringify(event)}`);
    const eventRepository = dataSource.getRepository(DBEvent);
    const eventObj = eventRepository.create(event);
    const savedEvent = await eventRepository.save(eventObj);
    return savedEvent;
  };

  extendedCall.updateEvent = async function (event: Partial<DBEvent>): Promise<DBEvent> {
    if (!event.id) {
      throw new Error('Cannot update event without ID');
    }

    extendedCall.logInfo(`Updating event: ${event.id}`);
    const eventRepository = dataSource.getRepository(DBEvent);
    const existingEvent = await eventRepository.findOneBy({ id: event.id });
    const updatedEvent = await eventRepository.save(existingEvent);
    return updatedEvent;
  };

  extendedCall.getGifts = async function (): Promise<Gift[]> {
    extendedCall.logInfo('Getting available gifts');
    const giftRepository = dataSource.getRepository(Gift);
    const gifts = await giftRepository.find();
    extendedCall.setContext('gifts', gifts);
    return gifts;
  };

  extendedCall.getEventGifts = async function (eventId: number): Promise<EventGift[]> {
    extendedCall.logInfo(`Getting gifts for event: ${eventId}`);
    const eventGiftRepository = dataSource.getRepository(EventGift);
    const eventGifts = await eventGiftRepository.find({
      where: { eventReferenceId: eventId },
      relations: ['gift']
    });
    return eventGifts;
  };

  extendedCall.saveEventGift = async function (eventGift: Partial<EventGift>): Promise<EventGift> {
    extendedCall.logInfo(`Saving event gift: ${JSON.stringify(eventGift)}`);
    const eventGiftRepository = dataSource.getRepository(EventGift);
    const eventGiftObj = eventGiftRepository.create(eventGift);
    const savedEventGift = await eventGiftRepository.save(eventGiftObj);
    return savedEventGift;
  };

  extendedCall.saveEventNote = async function (eventNote: Partial<EventNote>): Promise<EventNote> {
    extendedCall.logInfo(`Saving event note: ${JSON.stringify(eventNote)}`);
    const eventNoteRepository = dataSource.getRepository(EventNote);
    const eventNoteObj = eventNoteRepository.create(eventNote);
    const savedEventNote = await eventNoteRepository.save(eventNoteObj);
    return savedEventNote;
  };
  
  return extendedCall;
}
