import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource, IsNull } from "typeorm";
import { Event } from "src/db/entities/Event.entity";
import { Student } from "src/db/entities/Student.entity";
import { SelectionHandler } from "../../core/selection-handler";
import { SelectableEntity } from "../../core/base-selection-handler";

export interface SelectableEventItem extends SelectableEntity {
  originalEvent: Event;
}

export class EventForUpdateSelectionHandler extends SelectionHandler<SelectableEventItem> {
  private student: Student;

  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
  ) {
    // The repository here is a bit of a placeholder as fetchItems is fully overridden.
    // However, SelectionHandler constructor expects it. We pass Event repository.
    // Enable auto-selection for the event update handler
    super(logger, call, dataSource, "אירוע לעדכון", dataSource.getRepository(Event) as any, true);
  }

  /**
   * Sets the student for this selection handler.
   * @param student The student to set.
   */
  setStudent(student: Student): void {
    this.student = student;
  }

  /**
   * Fetches eligible events for the student and transforms them into SelectableEventItem objects.
   * Overrides the base fetchItems to provide custom logic.
   */
  protected async fetchItems(): Promise<void> {
    this.logStart('fetchItems (EventForUpdate)');
    const eventRepository = this.dataSource.getRepository(Event);
    const eligibleEvents = await eventRepository.find({
      where: {
        studentReferenceId: this.student.id,
        completedPathReferenceId: IsNull(),
      },
      relations: ['eventType'], // For formatting the name
      order: {
        eventDate: 'DESC'
      }
    });

    if (eligibleEvents.length === 0) {
      this.logger.log(`No eligible events for update found for student ${this.student.tz}`);
      this.items = [];
    } else {
      this.items = eligibleEvents.map((event, index) => {
        const eventDate = new Date(event.eventDate).toLocaleDateString('he-IL', {
          year: 'numeric', month: 'long', day: 'numeric'
        });
        const eventName = `${event.eventType?.name || event.name || 'אירוע'} מתאריך ${eventDate}`;

        return {
          id: event.id, // Use event id for the selectable item id
          key: index + 1, // User will press 1, 2, 3...
          name: eventName, // This will be used in the prompt by SelectionHandler
          originalEvent: event,
        };
      });
      this.logger.log(`Found ${this.items.length} eligible events for student ${this.student.tz}`);
    }
    this.logComplete('fetchItems (EventForUpdate)');
  }
  
  /**
   * Overrides the announceAutoSelectionResult method to provide a custom message
   * for auto-selected events
   */
  protected async announceAutoSelectionResult(): Promise<void> {
    if (this.selectedItem) {
      await this.playMessage(`מצאנו אירוע אחד זמין לעדכון: ${this.selectedItem.name}`);
    }
  }
}