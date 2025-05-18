import { Injectable } from '@nestjs/common';
import { BaseYemotHandlerService } from '../shared/utils/yemot/v2/yemot-router.service';
import { Student } from 'src/db/entities/Student.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { Gift } from 'src/db/entities/Gift.entity';
import { Event } from 'src/db/entities/Event.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { getJewishMonthByIndex, toGregorianDate } from 'jewish-date';
import { getHebrewMonthsList } from '@shared/utils/formatting/hebrew.util';

@Injectable()
export class YemotHandlerService extends BaseYemotHandlerService {
  private eventTypes: EventType[] = [];
  private gifts: Gift[] = [];

  override async processCall(): Promise<void> {
    this.logger.log(`Processing call with ID: ${this.call.callId}`);
    await this.getUserByDidPhone();
    this.loadEventTypes();
    this.loadGifts();

    const tz = await this.askForInput(await this.getTextByUserId('AUTHENTICATION.ID_PROMPT'), {
      min_digits: 1,
      max_digits: 9
    });
    const student = await this.getStudentByTz(tz);
    this.logger.log(`Student found: ${student.name}`);
    this.sendMessage(await this.getTextByUserId('GENERAL.WELCOME', { name: student.name }));

    const eventType = await this.getEventType();
    const eventDate = await this.getEventDate();
    const gift = await this.getGift();

    const eventRepo = this.dataSource.getRepository(Event);
    const event = eventRepo.create({
      userId: this.user.id,
      studentReferenceId: student.id,
      eventTypeReferenceId: eventType.id,
      eventDate: eventDate,
      name: `${student.name} - ${eventType.name}`,
    });
    const savedEvent = await eventRepo.save(event);
    this.logger.log(`Event created: ${savedEvent.id}`);

    const eventGiftRepo = this.dataSource.getRepository(EventGift);
    const eventGift = eventGiftRepo.create({
      userId: this.user.id,
      eventReferenceId: savedEvent.id,
      giftReferenceId: gift.id,
    });
    const savedEventGift = await eventGiftRepo.save(eventGift);
    this.logger.log(`Event gift created: ${savedEventGift.id}`);

    this.hangupWithMessage(await this.getTextByUserId('EVENT.SAVE_SUCCESS'));
  }

  private async getStudentByTz(tz: string) {
    this.logger.log(`Getting student by TZ: ${tz}`);
    const student = await this.dataSource.getRepository(Student).findOneBy({ userId: this.user.id, tz });
    if (!student) {
      this.hangupWithMessage(await this.getTextByUserId('AUTHENTICATION.STUDENT_NOT_FOUND'));
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
    const eventType = await this.askForMenu('EVENT.TYPE_SELECTION_PROMPT', this.eventTypes);

    if (!eventType) {
      this.hangupWithMessage(await this.getTextByUserId('GENERAL.INVALID_INPUT'));
    }
    this.logger.log(`Event type selected: ${eventType.name}`);
    return eventType;
  }

  private async getGift(): Promise<Gift> {
    this.logger.log(`Getting gift`);
    const gift = await this.askForMenu('VOUCHER.SELECTION_PROMPT', this.gifts);

    if (!gift) {
      this.hangupWithMessage(await this.getTextByUserId('GENERAL.INVALID_INPUT'));
    }
    this.logger.log(`Gift selected: ${gift.name}`);
    return gift;
  }

  private async getEventDate(): Promise<Date> {
    this.logger.log(`Getting event date`);

    const year = getCurrentHebrewYear();
    const day = await this.askForInput(await this.getTextByUserId('DATE.DAY_PROMPT'), {
      min_digits: 1,
      max_digits: 2,
    });
    const dayNumber = parseInt(day);

    const months = getHebrewMonthsList(year);
    const month = await this.askForMenu('DATE.MONTH_PROMPT', months);
    if (!month) {
      this.hangupWithMessage(await this.getTextByUserId('GENERAL.INVALID_INPUT'));
    }

    const eventDate = toGregorianDate({
      year: year,
      monthName: getJewishMonthByIndex(month.index, year),
      day: dayNumber,
    });

    this.logger.log(`Event date selected: ${eventDate.toISOString()}`);
    return eventDate;
  }
}
