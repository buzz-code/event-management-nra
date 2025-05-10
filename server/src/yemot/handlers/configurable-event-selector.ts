import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { Student } from "src/db/entities/Student.entity";
import { Event as DBEvent } from "src/db/entities/Event.entity";
import { SelectionHelper, SelectableEntity } from "./selection-helper";
import { EventEligibilityUtil, EventEligibilityType } from "../utils/event-eligibility.util";
import { CallUtils } from "../utils/call-utils";
import { FormatUtils } from "../utils/format-utils";

export interface SelectableEventItem extends SelectableEntity {
  originalEvent: DBEvent;
}

// Event selector that uses shared eligibility functions
export class ConfigurableEventSelector extends SelectionHelper<SelectableEventItem> {
  protected student: Student;
  private studentEvents: DBEvent[];
  private eligibilityCheck: (event: DBEvent) => boolean;

  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
    student: Student,
    events: DBEvent[],
    eligibilityType: EventEligibilityType = EventEligibilityType.NONE,
    autoSelectSingleItem: boolean = true,
  ) {
    super(logger, call, dataSource, 'אירוע', undefined, autoSelectSingleItem);

    this.student = student;
    this.studentEvents = events;

    // Set the eligibility check based on type
    switch (eligibilityType) {
      case EventEligibilityType.PATH:
        this.eligibilityCheck = EventEligibilityUtil.isEligibleForPathSelection;
        break;
      case EventEligibilityType.VOUCHER:
        this.eligibilityCheck = EventEligibilityUtil.isEligibleForVoucherSelection;
        break;
      case EventEligibilityType.POST_UPDATE:
        this.eligibilityCheck = EventEligibilityUtil.isEligibleForPostEventUpdate;
        break;
      case EventEligibilityType.NONE:
      default:
        this.eligibilityCheck = () => true; // No filtering by default
    }
  }

  protected async fetchItems(): Promise<void> {
    this.logStart(`fetchItems (ConfigurableEventSelector)`);

    // Use the events passed in from UserInteractionHandler
    const allStudentEvents = this.studentEvents;

    // Apply shared filtering and sorting logic
    const eligibleEvents = EventEligibilityUtil.filterEligibleEvents(
      allStudentEvents,
      this.eligibilityCheck
    );

    if (eligibleEvents.length === 0) {
      this.logger.log(`No eligible events found for student ${this.student.id}`);
      this.items = [];
    } else {
      this.items = eligibleEvents.map((event: DBEvent, index) => {
        const eventName = FormatUtils.formatEventNameForSelection(event);
        return {
          id: event.id,
          key: index + 1,
          name: eventName,
          originalEvent: event,
        };
      });
      this.logger.log(`Found ${this.items.length} eligible events for student ${this.student.id}`);
    }
    this.logComplete(`fetchItems (ConfigurableEventSelector)`);
  }

  protected async announceAutoSelectionResult(): Promise<void> {
    const selectedItem = this.getSelectedItem();
    if (selectedItem) {
      // Uses this.entityName ('אירוע') for a general term.
      await CallUtils.playMessage(this.call, `מצאנו ${this.entityName} אחד זמין לבחירה: ${selectedItem.name}`, this.logger);
    }
  }

  public getSelectedOriginalEvent(): DBEvent | null {
    const selectedItem = this.getSelectedItem();
    return selectedItem ? selectedItem.originalEvent : null;
  }
}
