import { Injectable } from '@nestjs/common';
import { BaseYemotHandlerService } from '../shared/utils/yemot/v2/yemot-router.service';
import { Student } from 'src/db/entities/Student.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { Gift } from 'src/db/entities/Gift.entity';
import { Event } from 'src/db/entities/Event.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { getJewishMonthByIndex, toGregorianDate } from 'jewish-date';
import { formatHebrewDateForIVR, getHebrewMonthsList } from '@shared/utils/formatting/hebrew.util';

@Injectable()
export class YemotHandlerService extends BaseYemotHandlerService {
  private eventTypes: EventType[] = [];
  private gifts: Gift[] = [];

  override async processCall(): Promise<void> {
    this.logger.log(`Processing call with ID: ${this.call.callId}`);
    await this.getUserByDidPhone();
    this.loadEventTypes();
    this.loadGifts();

    const student = await this.getStudentByTz();
    this.logger.log(`Student found: ${student.name}`);
    this.sendMessage(await this.getTextByUserId('GENERAL.WELCOME', { name: student.name }));

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

    this.sendMessage(await this.getTextByUserId('EVENT.SAVE_SUCCESS'));
    this.hangupWithMessage(await this.getTextByUserId('EVENT.GIFTS_ADDED', { count: gifts.length }));
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

    const tz = await this.askForInput(await this.getTextByUserId('STUDENT.TZ_PROMPT'), {
      min_digits: 1,
      max_digits: 9
    });
    const student = await this.fetchStudentByTz(tz);

    if (student) {
      return student;
    }

    this.sendMessage(await this.getTextByUserId('STUDENT.NOT_FOUND'));
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
      this.hangupWithMessage(await this.getTextByUserId('GENERAL.INVALID_INPUT'));
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
    this.logger.log(`Getting gifts - up to 3 allowed`);
    const selectedGifts: Gift[] = [];
    let continueSelection = true;

    while (continueSelection && selectedGifts.length < 3) {
      const availableGifts = this.gifts.filter(g => !selectedGifts.some(sg => sg.id === g.id));

      const promptKey = selectedGifts.length === 0 ? 'EVENT.GIFT_SELECTION' : 'EVENT.ADDITIONAL_GIFT_SELECTION';
      const gift = await this.askForMenu(promptKey, availableGifts);

      if (!gift) {
        this.hangupWithMessage(await this.getTextByUserId('GENERAL.INVALID_INPUT'));
      }

      selectedGifts.push(gift);
      this.logger.log(`Gift selected: ${gift.name} (${selectedGifts.length} of 3)`);

      if (selectedGifts.length < 3) {
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

    const year = getCurrentHebrewYear();
    const day = await this.askForInput(await this.getTextByUserId('DATE.DAY_SELECTION'), {
      min_digits: 1,
      max_digits: 2,
    });
    const dayNumber = parseInt(day);

    const months = getHebrewMonthsList(year);
    const month = await this.askForMenu('DATE.MONTH_SELECTION', months);
    if (!month) {
      this.hangupWithMessage(await this.getTextByUserId('GENERAL.INVALID_INPUT'));
    }

    const eventDate = toGregorianDate({
      year: year,
      monthName: getJewishMonthByIndex(month.index, year),
      day: dayNumber,
    });

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
}
