import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { Student } from "src/db/entities/Student.entity";
import { Event } from "src/db/entities/Event.entity";
import { SelectionHelper, SelectableEntity } from "./selection-helper";
import { CallUtils } from "../utils/call-utils";
import { FormatUtils } from "../utils/format-utils";

export interface SelectableEventItem extends SelectableEntity {
  originalEvent: Event;
}

// This class is now a generic event selector based on student and completion status.
export class ConfigurableEventSelector extends SelectionHelper<SelectableEventItem> {
  private student: Student;

  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
    student: Student,
    autoSelectSingleItem: boolean = true,
  ) {
    super(logger, call, dataSource, 'אירוע', undefined, autoSelectSingleItem);
    
    this.student = student;
  }

  protected async fetchItems(): Promise<void> {
    this.logStart(`fetchItems (ConfigurableEventSelector)`);
    const eventRepository = this.dataSource.getRepository(Event);

    // Generic query for events based on student and completion status
    const eligibleEvents = await eventRepository.find({
      where: {
        studentReferenceId: this.student.id,
        completed: false,
      },
      relations: ['eventType'],
      order: { eventDate: 'DESC' },
    });

    if (eligibleEvents.length === 0) {
      this.logger.log(`No eligible events found for student \${this.student.id}`);
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
      this.logger.log(`Found \${this.items.length} eligible events for student \${this.student.id}`);
    }
    this.logComplete(`fetchItems (ConfigurableEventSelector)`);
  }

  protected async announceAutoSelectionResult(): Promise<void> {
    const selectedItem = this.getSelectedItem();
    if (selectedItem) {
      // Uses this.messagePrefix ('אירוע') for a general term.
      await CallUtils.playMessage(this.call, `מצאנו \${this.messagePrefix} אחד זמין לבחירה: \${selectedItem.name}`, this.logger);
    }
  }

  public getSelectedOriginalEvent(): Event | null {
    const selectedItem = this.getSelectedItem();
    return selectedItem ? selectedItem.originalEvent : null;
  }
}
