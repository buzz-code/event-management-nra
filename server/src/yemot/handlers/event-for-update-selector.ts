import { Logger } from '@nestjs/common';
import { Call } from 'yemot-router2';
import { DataSource, IsNull, LessThan } from 'typeorm';
import { Student } from 'src/db/entities/Student.entity';
import { Event } from 'src/db/entities/Event.entity';
import { SelectionHelper, SelectableEntity } from './selection-helper';
import { CallUtils } from '../utils/call-utils';
import { FormatUtils } from '../utils/format-utils';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';

export interface SelectableEventItem extends SelectableEntity {
  originalEvent: Event;
}

export class EventForUpdateSelector extends SelectionHelper<SelectableEventItem> {
  private student: Student;

  constructor(call: Call, dataSource: DataSource, student: Student, autoSelectSingleItem = true) {
    // No repository is passed to the base class, as fetchItems is overridden
    super(call, dataSource, 'אירוע לעדכון', undefined, autoSelectSingleItem);
    this.student = student;
  }

  protected async fetchItems(): Promise<void> {
    this.logStart('fetchItems (EventForUpdateSelector)');
    const eventRepository = this.dataSource.getRepository(Event);
    const eligibleEvents = await eventRepository.find({
      where: {
        studentReferenceId: this.student.id,
        completedPathReferenceId: IsNull(), // Event not yet marked as completed with a path
        eventDate: LessThan(new Date()), // Event date is in the past
      },
      relations: ['eventType'],
      order: { eventDate: 'DESC' },
    });

    if (eligibleEvents.length === 0) {
      this.call.logInfo(`No eligible events for update found for student ${this.student.id}`);
      this.items = [];
    } else {
      this.items = eligibleEvents.map((event, index) => {
        const eventName = FormatUtils.formatEventNameForSelection(event);
        return {
          id: event.id,
          key: index + 1,
          name: eventName,
          originalEvent: event,
        };
      });
      this.call.logInfo(`Found ${this.items.length} eligible events for student ${this.student.id}`);
    }
    this.logComplete('fetchItems (EventForUpdateSelector)');
  }

  protected async announceAutoSelectionResult(): Promise<void> {
    const selectedItem = this.getSelectedItem();
    if (selectedItem) {
      await this.call.playMessage(MESSAGE_CONSTANTS.SELECTION.AUTO_SELECTED_FOR_UPDATE(selectedItem.name));
    }
  }
}
