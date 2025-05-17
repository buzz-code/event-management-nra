import { DataSource, EntityTarget, Repository, QueryRunner, Between } from 'typeorm';
import { Call, TapOptions } from 'yemot-router2';
import { Logger } from '@nestjs/common';
import { id_list_message, id_list_message_with_hangup } from '@shared/utils/yemot/yemot-router';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';
import { Student } from 'src/db/entities/Student.entity';
import { User } from 'src/db/entities/User.entity';
import { Event as DBEvent } from 'src/db/entities/Event.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { EventNote } from 'src/db/entities/EventNote.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';
import { Gift } from 'src/db/entities/Gift.entity';
import { Class } from 'src/db/entities/Class.entity';
import { LevelType } from 'src/db/entities/LevelType.entity';

declare module 'yemot-router2' {
  interface Call {
    userId?: number;
    // Existing methods
    logInfo(message: string): void;
    logDebug(message: string): void;
    logWarn(message: string): void;
    logError(message: string, stack?: string): void;

    // Call interaction methods
    getConfirmation(message: string, yesOption?: string, noOption?: string): Promise<boolean>;
    readDigits(promptText: string, options: TapOptions): Promise<string>;
    playMessage(message: string): Promise<void>;
    hangupWithMessage(message: string): Promise<void>;

    // New context management methods
    setContext<T>(key: string, value: T): void;
    getContext<T>(key: string): T | undefined;

    // New message retrieval method    
    getText(key: string, values?: Record<string, string>): string;

    // New retry capability
    withRetry<T>(
      operation: () => Promise<T>,
      options?: {
        retryMessage?: string,
        errorMessage?: string,
        maxAttempts?: number
      }
    ): Promise<T>;

    // New data access methods
    findUserByPhone(): Promise<User | null>;
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
    withTransaction<T>(fn: (queryRunner: QueryRunner) => Promise<T>): Promise<T>;
  }
}

/**
 * Factory function that creates an ExtendedCall which implements the Call interface
 * and adds custom functionality directly (no forwarding to CallUtils)
 */
export function createExtendedCall(call: Call, logger: Logger, dataSource: DataSource): Call {
  // Create a new object that copies all properties and methods from the original call
  const extendedCall = Object.create(Object.getPrototypeOf(call), Object.getOwnPropertyDescriptors(call)) as Call;

  // Context storage
  const context: Record<string, any> = {};

  // Context management methods
  extendedCall.setContext = function <T>(key: string, value: T): void {
    context[key] = value;
    extendedCall.logDebug(`Context set: ${key}`);
  };

  extendedCall.getContext = function <T>(key: string): T | undefined {
    return context[key];
  };

  // Enhanced Logging capabilities
  extendedCall.logInfo = function (message: string): void {
    logger.log(`[Call ${extendedCall.callId}] ${message}`);
  };
  extendedCall.logDebug = function (message: string): void {
    logger.debug(`[Call ${extendedCall.callId}] ${message}`);
  };
  extendedCall.logWarn = function (message: string): void {
    logger.warn(`[Call ${extendedCall.callId}] ${message}`);
  };
  extendedCall.logError = function (message: string, stack?: string): void {
    logger.error(`[Call ${extendedCall.callId}] ${message}`, stack);
  };

  // Call interaction methods (implemented directly, no forwarding to CallUtils)
  extendedCall.getConfirmation = async function (
    message: string,
    yesOption: string = MESSAGE_CONSTANTS.GENERAL.YES_OPTION,
    noOption: string = MESSAGE_CONSTANTS.GENERAL.NO_OPTION,
  ): Promise<boolean> {
    extendedCall.logDebug(`Getting confirmation: ${message}`);
    const promptMessage = `${message} ${yesOption}, ${noOption}`;

    const response = await extendedCall.read([{ type: 'text', data: promptMessage }], 'tap', {
      max_digits: 1,
      min_digits: 1,
      digits_allowed: ['1', '2'],
    }) as string;

    const confirmed = response === '1';
    extendedCall.logDebug(`Confirmation response: ${confirmed ? 'Yes' : 'No'}`);
    return confirmed;
  };

  extendedCall.readDigits = async function (promptText: string, options: TapOptions): Promise<string> {
    extendedCall.logDebug(`Reading digits with prompt: ${promptText}`);
    const result = await extendedCall.read([{ type: 'text', data: promptText }], 'tap', options) as string;
    extendedCall.logDebug(`Digits entered: ${result}`);
    return result;
  };

  extendedCall.playMessage = async function (message: string): Promise<void> {
    extendedCall.logDebug(`Playing message: ${message}`);
    await id_list_message(extendedCall, message);
  };

  extendedCall.hangupWithMessage = async function (message: string): Promise<void> {
    extendedCall.logDebug(`Hanging up with message: ${message}`);
    await id_list_message_with_hangup(extendedCall, message);
  };

  // Message retrieval method
  extendedCall.getText = function (key: string, values?: Record<string, string>): string {
    const keyParts = key.split('.');
    let message: any = MESSAGE_CONSTANTS;
    for (const part of keyParts) {
      if (message[part] === undefined) {
        extendedCall.logError(`Message key not found: ${key}`);
        return key;
      }
      message = message[part];
    }
    if (typeof message !== 'string') {
      extendedCall.logError(`Message key is not a string: ${key}`);
      return key;
    }
    if (values) {
      for (const [placeholder, value] of Object.entries(values)) {
        message = (message as string).replace(new RegExp(`{${placeholder}}`, 'g'), value);
      }
    }
    return message;
  };

  // Entity data access methods
  extendedCall.findUserByPhone = async function (): Promise<User | null> {
    extendedCall.logInfo(`Finding user for phone number: ${extendedCall.did}`);
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOneBy({ phoneNumber: extendedCall.did });
    if (user) {
      extendedCall.logInfo(`User found: ${user.id}`);
      extendedCall.userId = user.id;
      extendedCall.setContext('user', user);
    } else {
      extendedCall.logError(`User not found for phone number: ${extendedCall.did}`);
    }
    return user;
  };

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
    const savedEvent = await eventRepository.save(event);
    return savedEvent;
  };

  extendedCall.updateEvent = async function (event: Partial<DBEvent>): Promise<DBEvent> {
    if (!event.id) {
      throw new Error('Cannot update event without ID');
    }

    extendedCall.logInfo(`Updating event: ${event.id}`);
    const eventRepository = dataSource.getRepository(DBEvent);
    const updatedEvent = await eventRepository.save(event);
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
    const savedEventGift = await eventGiftRepository.save(eventGift);
    return savedEventGift;
  };

  extendedCall.saveEventNote = async function (eventNote: Partial<EventNote>): Promise<EventNote> {
    extendedCall.logInfo(`Saving event note: ${JSON.stringify(eventNote)}`);
    const eventNoteRepository = dataSource.getRepository(EventNote);
    const savedEventNote = await eventNoteRepository.save(eventNote);
    return savedEventNote;
  };

  // Transaction support
  extendedCall.withTransaction = async function <T>(fn: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await fn(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      extendedCall.logError(`Transaction failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  };

  // Enhanced retry capability
  extendedCall.withRetry = async function <T>(
    operation: () => Promise<T>,
    options: {
      retryMessage?: string,
      errorMessage?: string,
      maxAttempts?: number
    } = {}
  ): Promise<T> {
    const maxAttempts = options.maxAttempts ?? 3;
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        extendedCall.logError(`Operation failed (${attempts}/${maxAttempts}): ${error.message}`);

        if (attempts >= maxAttempts) {
          if (options.errorMessage) {
            await extendedCall.hangupWithMessage(options.errorMessage);
          }
          throw error;
        }

        if (options.retryMessage) {
          await extendedCall.playMessage(options.retryMessage);
        }
      }
    }

    // This should never happen due to the throw above
    throw new Error('Max retry attempts reached');
  };

  return extendedCall;
}
