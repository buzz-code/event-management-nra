import { Injectable } from '@nestjs/common';
import { LessThan, Raw } from 'typeorm';
import { BaseYemotHandlerService } from '../shared/utils/yemot/v2/yemot-router.service';
import { Student } from 'src/db/entities/Student.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { Gift } from 'src/db/entities/Gift.entity';
import { Event } from 'src/db/entities/Event.entity';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { formatHebrewDateForIVR, gematriyaLetters, getGregorianDateFromHebrew, getHebrewMonthsList } from '@shared/utils/formatting/hebrew.util';
import { Class } from 'src/db/entities/Class.entity';
import { StudentClass } from 'src/db/entities/StudentClass.entity';

const MAX_GIFTS = 5;

@Injectable()
export class YemotHandlerService extends BaseYemotHandlerService {
  private eventTypes: EventType[] = [];
  private gifts: Gift[] = [];

  override async processCall(): Promise<void> {
    this.logger.log(`Processing call with ID: ${this.call.callId}`);
    await this.getUserByDidPhone();

    if (this.user.additionalData?.maintainanceMessage) {
      return this.hangupWithMessage(this.user.additionalData.maintainanceMessage);
    }

    // TODO: should student enter with 99999, or type it here?
    if (this.call.ApiEnterID && this.call.ApiEnterID.includes('999999')) {
      this.logger.log(`User requested to listen to class celebrations`);
      return this.processClassCelebrationsListener();
    }

    this.loadEventTypes();
    this.loadGifts();

    const student = await this.getStudentByTz();
    this.logger.log(`Student found: ${student.name}`);
    await this.sendMessageByKey('GENERAL.WELCOME', { name: student.name });

    const mainMenuSelection = await this.askForInputByKey('GENERAL.MAIN_MENU');
    if (mainMenuSelection === '1') {
      await this.createEventForStudent(student);
    } else if (mainMenuSelection === '2') {
      await this.updateEventFulfillment(student);
    }
  }

  private async createEventForStudent(student: Student): Promise<void> {
    this.logger.log(`Creating event for student: ${student.name}`);
    const eventType = await this.getEventType();
    const eventDate = await this.getEventDate();
    const gifts = await this.getGifts();

    const eventRepo = this.dataSource.getRepository(Event);
    const event = eventRepo.create({
      userId: this.user.id,
      studentReferenceId: student.id,
      eventTypeReferenceId: eventType.id,
      eventDate: eventDate,
      name: `${student.name} - ${eventType.name}`,
      eventGifts: gifts.map(gift => ({
        userId: this.user.id,
        giftReferenceId: gift.id,
      })),
    });
    const savedEvent = await eventRepo.save(event);
    this.logger.log(`Event created: ${savedEvent.id}`);

    await this.sendMessageByKey('EVENT.SAVE_SUCCESS');
    await this.hangupWithMessageByKey('EVENT.GIFTS_ADDED', { count: gifts.length });
  }

  private async getStudentByTz(): Promise<Student> {
    this.logger.log(`Getting student by TZ`);

    if (this.call.ApiEnterID) {
      const matches = this.call.ApiEnterID.match(/\d+$/);
      if (matches && matches[0]) {
        const idNumber = matches[0];
        this.logger.log(`Extracted ID from ApiEnterID: ${idNumber}`);
        const student = await this.fetchStudentByTz(idNumber);

        if (student) {
          return student;
        }
      }
      this.logger.log(`No student found with ApiEnterID: ${this.call.ApiEnterID}`);
    }

    const tz = await this.askForInputByKey('STUDENT.TZ_PROMPT', {}, {
      min_digits: 1,
      max_digits: 9
    });
    const student = await this.fetchStudentByTz(tz);

    if (student) {
      return student;
    }

    await this.sendMessageByKey('STUDENT.NOT_FOUND');
    return this.getStudentByTz();
  }

  private async fetchStudentByTz(tz: string): Promise<Student | null> {
    this.logger.log(`Fetching student by TZ: ${tz}`);
    const student = await this.dataSource.getRepository(Student).findOneBy({
      userId: this.user.id,
      tz
    });
    if (!student) {
      this.logger.log(`No student found with TZ: ${tz}`);
    }
    return student;
  }

  private async loadEventTypes() {
    this.logger.log(`Loading event types`);
    this.eventTypes = await this.dataSource.getRepository(EventType).find({
      where: {
        userId: this.user.id
      },
      order: {
        key: 'ASC'
      }
    });
    this.logger.log(`Event types loaded: ${this.eventTypes.length}`);
  }

  private async loadGifts() {
    this.logger.log(`Loading gifts`);
    this.gifts = await this.dataSource.getRepository(Gift).find({
      where: {
        userId: this.user.id
      },
      order: {
        key: 'ASC'
      }
    });
    this.logger.log(`Gifts loaded: ${this.gifts.length}`);
  }

  private async getEventType(): Promise<EventType> {
    this.logger.log(`Getting event type`);
    const eventType = await this.askForMenu('EVENT.TYPE_SELECTION', this.eventTypes);

    if (!eventType) {
      await this.hangupWithMessageByKey('GENERAL.INVALID_INPUT');
    }
    this.logger.log(`Event type selected: ${eventType.name}`);

    const isConfirmed = await this.askConfirmation(
      'EVENT.CONFIRM_TYPE',
      { name: eventType.name }
    );

    if (!isConfirmed) {
      this.logger.log(`Event type not confirmed, selecting again`);
      return this.getEventType();
    }

    return eventType;
  }

  private async getGifts(): Promise<Gift[]> {
    this.logger.log(`Getting gifts - up to ${MAX_GIFTS} allowed`);
    const selectedGifts: Gift[] = [];
    let continueSelection = true;

    while (continueSelection && selectedGifts.length < MAX_GIFTS) {
      const availableGifts = this.gifts.filter(g => !selectedGifts.some(sg => sg.id === g.id));

      const promptKey = selectedGifts.length === 0 ? 'EVENT.GIFT_SELECTION' : 'EVENT.ADDITIONAL_GIFT_SELECTION';
      const gift = await this.askForMenu(promptKey, availableGifts);

      if (!gift) {
        await this.hangupWithMessageByKey('GENERAL.INVALID_INPUT');
      }

      selectedGifts.push(gift);
      this.logger.log(`Gift selected: ${gift.name} (${selectedGifts.length} of ${MAX_GIFTS})`);

      if (selectedGifts.length < MAX_GIFTS) {
        this.logger.log(`Asking if user wants to select another gift`);
        continueSelection = await this.askConfirmation('EVENT.SELECT_ANOTHER_GIFT');
      }
    }

    const giftNames = selectedGifts.map(g => g.name).join(', ');
    this.logger.log(`Gifts selected: ${giftNames}`);
    const isConfirmed = await this.askConfirmation('EVENT.CONFIRM_GIFTS', { gifts: giftNames, count: selectedGifts.length });

    if (!isConfirmed) {
      this.logger.log(`Gift selection not confirmed, starting over`);
      return this.getGifts();
    }

    return selectedGifts;
  }

  private async getEventDate(): Promise<Date> {
    this.logger.log(`Getting event date`);

    const year = getCurrentHebrewYear(false);
    const day = await this.askForInputByKey('DATE.DAY_SELECTION', {}, {
      min_digits: 1,
      max_digits: 2,
    });
    const dayNumber = parseInt(day);

    const months = getHebrewMonthsList(year);
    const month = await this.askForMenu('DATE.MONTH_SELECTION', months);
    if (!month) {
      await this.hangupWithMessageByKey('GENERAL.INVALID_INPUT');
    }

    const eventDate = this.createEventDateWithYearAdjustment(year, month.index, dayNumber);

    this.logger.log(`Event date selected: ${eventDate.toISOString()}`);

    const hebrewDate = formatHebrewDateForIVR(eventDate);
    const isConfirmed = await this.askConfirmation(
      'DATE.CONFIRM_DATE',
      { date: hebrewDate },
    );

    if (!isConfirmed) {
      return this.getEventDate();
    }

    return eventDate;
  }

  private createEventDateWithYearAdjustment(year: number, monthIndex: number, dayNumber: number): Date {
    let eventDate = getGregorianDateFromHebrew(year, monthIndex, dayNumber);

    const today = new Date();
    const daysDifference = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference > 100) {
      this.logger.log(`Selected date ${eventDate.toISOString()} is more than 100 days ago (${daysDifference} days), using next year`);
      eventDate = getGregorianDateFromHebrew(year + 1, monthIndex, dayNumber);
    }

    return eventDate;
  }

  private async processClassCelebrationsListener(): Promise<void> {
    this.logger.log(`Processing class celebrations listener`);

    await this.sendMessageByKey('CELEBRATIONS.WELCOME');

    const grade = await this.getGradeForCelebrations();
    const classEntity = await this.getClassNumber(grade);

    const currentYear = getCurrentHebrewYear();
    const month = await this.getMonthForCelebrations(currentYear);

    await this.readClassCelebrations(classEntity, currentYear, month.name);

    await this.hangupWithMessageByKey('CELEBRATIONS.GOODBYE');
  }

  private async getGradeForCelebrations(): Promise<string> {
    this.logger.log(`Getting grade for celebrations`);

    const gradeInput = await this.askForInputByKey('CELEBRATIONS.GRADE_PROMPT', {}, {
      min_digits: 1,
      max_digits: 2
    }
    );

    const grade = parseInt(gradeInput);

    if (grade < 9 || grade > 14) {
      await this.sendMessageByKey('CELEBRATIONS.INVALID_GRADE');
      return this.getGradeForCelebrations();
    }

    const gradeName = gematriyaLetters(grade, false);
    this.logger.log(`Grade selected: ${gradeName} (${grade})`);
    return gradeName;
  }

  private async getClassNumber(grade: string): Promise<Class> {
    this.logger.log(`Getting class number for grade ${grade}`);

    const classNumberInput = await this.askForInputByKey('CELEBRATIONS.CLASS_PROMPT', {}, {
      min_digits: 1,
      max_digits: 2
    }
    );

    const classNumber = parseInt(classNumberInput);
    const expectedClassName = `${grade}${classNumber}`;

    const classEntity = await this.dataSource.getRepository(Class).findOne({
      where: {
        userId: this.user.id,
        name: expectedClassName,
        gradeLevel: grade
      }
    });

    if (!classEntity) {
      await this.sendMessageByKey('CELEBRATIONS.INVALID_CLASS');
      return this.getClassNumber(grade);
    }

    this.logger.log(`Class selected: ${expectedClassName}`);
    return classEntity;
  }

  private async getMonthForCelebrations(currentYear: number) {
    this.logger.log(`Getting month for celebrations`);

    const months = getHebrewMonthsList(currentYear);
    const month = await this.askForMenu('DATE.MONTH_SELECTION', months);
    if (!month) {
      await this.sendMessageByKey('GENERAL.INVALID_INPUT');
      return this.getMonthForCelebrations(currentYear);
    }

    this.logger.log(`Month selected: ${month.name} (${month.index})`);
    return month;
  }

  private async readClassCelebrations(classEntity: Class, currentYear: number, monthName: string): Promise<void> {
    this.logger.log(`Reading celebrations for class ${classEntity.name} month ${monthName}`);

    const events = await this.dataSource.getRepository(Event)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.eventType', 'eventType')
      .innerJoin(Student, 'student', 'student.id = event.studentReferenceId')
      .innerJoin(StudentClass, 'studentClass', 'studentClass.studentReferenceId = student.id')
      .where('event.userId = :userId', { userId: this.user.id })
      .andWhere('studentClass.classReferenceId = :classId', { classId: classEntity.id })
      .andWhere('studentClass.year = :year', { year: currentYear })
      .andWhere('event.eventHebrewMonth = :monthName', { monthName })
      .orderBy('student.name', 'ASC')
      .addOrderBy('event.eventDate', 'ASC')
      .getMany();

    if (events.length === 0) {
      await this.hangupWithMessageByKey('CELEBRATIONS.NO_CELEBRATIONS_FOUND', {
        className: classEntity.name,
        month: monthName
      });
      return;
    }

    const studentsWithEvents = await this.dataSource.getRepository(Student)
      .createQueryBuilder('student')
      .where('student.id IN (:...studentIds)', {
        studentIds: events.map(e => e.studentReferenceId)
      })
      .getMany();

    const studentMap = new Map(studentsWithEvents.map(s => [s.id, s]));

    const eventsByStudent = events.reduce((acc, event) => {
      const student = studentMap.get(event.studentReferenceId);
      if (student) {
        const studentName = student.name;
        if (!acc[studentName]) {
          acc[studentName] = [];
        }
        acc[studentName].push(event);
      }
      return acc;
    }, {} as Record<string, Event[]>);

    await this.sendMessageByKey('CELEBRATIONS.READING_START', {
      className: classEntity.name,
      month: monthName,
      count: events.length.toString()
    });

    for (const [studentName, studentEvents] of Object.entries(eventsByStudent)) {
      await this.sendMessageByKey('CELEBRATIONS.STUDENT_NAME', { name: studentName });

      for (const event of studentEvents) {
        await this.sendMessageByKey('CELEBRATIONS.EVENT_DETAIL', {
          eventType: event.eventType.name,
          date: formatHebrewDateForIVR(event.eventDate)
        });
      }
    }

    await this.sendMessageByKey('CELEBRATIONS.READING_COMPLETE');
  }

  private async updateEventFulfillment(student: Student): Promise<void> {
    this.logger.log(`Updating event fulfillment for student: ${student.name}`);

    // Send start message
    await this.sendMessageByKey('FULFILLMENT.START_MESSAGE', { name: student.name });

    // Find the last event where the first fulfillment question is null
    const event = await this.findEventForFulfillment(student);

    if (!event) {
      await this.sendMessageByKey('FULFILLMENT.NO_EVENT_FOUND');
      await this.hangupWithMessageByKey('FULFILLMENT.GOODBYE');
      return;
    }

    // Collect fulfillment data for all 11 questions
    const fulfillmentData: Record<string, number> = {};

    const numberOfQuestions = 11;
    // Ask each question and get level selection
    for (let i = 1; i <= numberOfQuestions; i++) {
      const level = await this.getQuestionLevel(i);
      fulfillmentData[`fulfillmentQuestion${i}`] = level;
      this.logger.log(`Question ${i}: Level ${level} selected`);
    }

    // Update the event with fulfillment data
    await this.saveEventFulfillment(event, fulfillmentData);

    // Send data saved message and hangup
    await this.sendMessageByKey('FULFILLMENT.DATA_SAVED');
    await this.hangupWithMessageByKey('FULFILLMENT.GOODBYE');
  }

  private async findEventForFulfillment(student: Student): Promise<Event | null> {
    this.logger.log(`Finding event for fulfillment for student: ${student.name}`);

    const eventRepo = this.dataSource.getRepository(Event);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for comparison

    const event = await eventRepo.findOne({
      where: {
        userId: this.user.id,
        studentReferenceId: student.id,
        fulfillmentQuestion1: Raw(alias => `COALESCE(${alias}, 0) <= 0`),
        eventDate: LessThan(today) // Only events in the past
      },
      order: {
        eventDate: 'DESC' // Get the most recent past event
      }
    });

    if (event) {
      this.logger.log(`Found event for fulfillment: ${event.id} (date: ${event.eventDate})`);
    } else {
      this.logger.log(`No past event found for fulfillment`);
    }

    return event;
  }

  private async saveEventFulfillment(event: Event, fulfillmentData: Record<string, number>): Promise<void> {
    this.logger.log(`Saving event fulfillment for event: ${event.id}`);

    const eventRepo = this.dataSource.getRepository(Event);

    // Update the event with fulfillment data
    Object.assign(event, fulfillmentData);

    await eventRepo.save(event);
    this.logger.log(`Event fulfillment saved successfully for event: ${event.id}`);
  }

  private async getQuestionLevel(questionNumber: number): Promise<number> {
    this.logger.log(`Getting level for question ${questionNumber}`);

    // Use specific question key for each question
    const questionKey = `FULFILLMENT.QUESTION_${questionNumber}`;

    const levelInput = await this.askForInputByKey(questionKey, {}, {
      min_digits: 1,
      max_digits: 1
    }
    );

    const level = parseInt(levelInput);

    // Validate level is between 1-3
    if (level < 1 || level > 3) {
      await this.sendMessageByKey('FULFILLMENT.INVALID_LEVEL');
      return this.getQuestionLevel(questionNumber);
    }

    this.logger.log(`Question ${questionNumber}: Level ${level} selected`);

    return level;
  }
}
