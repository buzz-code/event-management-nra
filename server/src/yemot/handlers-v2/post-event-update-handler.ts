import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource, IsNull } from "typeorm";
import { BaseYemotHandler } from "../core/base-yemot-handler";
import { Student } from "src/db/entities/Student.entity";
// Event is now imported via EventForUpdateSelector
// import { LevelType } from "src/db/entities/LevelType.entity"; // Not directly used here anymore for event selection
// SelectionHelper is used by EventForUpdateSelector
import { EventPersistenceHandler } from "./event-persistence-handler";
import { PathSelectionHandler } from "./path-selection-handler";
import { CallUtils } from "../utils/call-utils";
import { MESSAGE_CONSTANTS } from "../constants/message-constants";
// FormatUtils is used by EventForUpdateSelector
import { EventForUpdateSelector, SelectableEventItem } from "./event-for-update-selector"; // Import the new selector

/**
 * Handler for updating post-event completion status (V2)
 * Allows students to report which path they have completed after their celebration.
 */
export class PostEventUpdateHandlerV2 extends BaseYemotHandler {
  private student: Student | null = null;
  private eventPersistenceHandler: EventPersistenceHandler;

  constructor(
    logger: Logger,
    call: Call,
    dataSource: DataSource,
  ) {
    super(logger, call, dataSource);
    this.eventPersistenceHandler = new EventPersistenceHandler(this.logger, this.dataSource);
  }

  setStudent(student: Student): void {
    this.student = student;
  }

  async handlePostEventUpdate(): Promise<boolean> {
    this.logStart('handlePostEventUpdate');

    try {
      if (!this.student) {
        this.logger.error('Student not set for PostEventUpdateHandlerV2');
        await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.GENERAL.ERROR, this.logger);
        return false;
      }

    // 1. Create an event selector using the new specialized class
    if (!this.student) {
      // This check is already present, but good to re-iterate dependency
      this.logger.error('Student not set, cannot create EventForUpdateSelector');
      await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.GENERAL.ERROR, this.logger);
      return false;
    }
    const eventSelector = new EventForUpdateSelector(this.logger, this.call, this.dataSource, this.student);

    const selectedEventItem = await eventSelector.handleSingleSelection();

    if (!selectedEventItem) {
      this.logger.log('No event selected for update by user or selection failed (V2).');
      // SelectionHelper would have played appropriate messages and hung up if necessary.
      return false;
    }
    const eventToUpdate = selectedEventItem.originalEvent;
    this.logger.log(`Proceeding with selected event: ${eventToUpdate.name} (ID: ${eventToUpdate.id}) (V2)`);

    // 2. Select Completed Path
    // PathSelectionHandler is a SelectionHelper<LevelType>
    const pathSelector = new PathSelectionHandler(this.logger, this.call, this.dataSource);
    const selectedPath = await pathSelector.handleSingleSelection();

    if (!selectedPath) {
      this.logger.log('No path selected by the user or selection process failed (V2).');
      // PathSelectionHandlerV2 (via SelectionHelper) would handle messages.
      await CallUtils.playMessage(this.call, MESSAGE_CONSTANTS.PATH.NO_PATH_SELECTED, this.logger);
      return false;
    }

      // 3. Update Event Completion Status
      await this.eventPersistenceHandler.recordEventCompletion(eventToUpdate, selectedPath);
      await CallUtils.playMessage(this.call, MESSAGE_CONSTANTS.POST_EVENT.UPDATE_SUCCESS, this.logger);
      this.logComplete('handlePostEventUpdate', { eventId: eventToUpdate.id, pathId: selectedPath.id });
      return true;
    } catch (error) {
      this.logError('handlePostEventUpdate', error as Error);
      await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.POST_EVENT.UPDATE_ERROR, this.logger);
      return false;
    }
  }
  // The createEventSelector method is no longer needed as we directly instantiate EventForUpdateSelector.
}