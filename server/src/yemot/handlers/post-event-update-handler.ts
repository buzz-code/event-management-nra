import { Logger } from '@nestjs/common';
import { Call } from 'yemot-router2';
import { DataSource, IsNull } from 'typeorm';
import { BaseYemotHandler } from '../core/base-yemot-handler';
import { Student } from 'src/db/entities/Student.entity';
import { Event as DBEvent } from 'src/db/entities/Event.entity'; // Added import for DBEvent
// Event is now imported via EventForUpdateSelector
// import { LevelType } from "src/db/entities/LevelType.entity"; // Not directly used here anymore for event selection
// SelectionHelper is used by EventForUpdateSelector
import { EventPersistenceHandler } from './event-persistence-handler';
import { PathSelectionHandler } from './path-selection-handler';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';
// FormatUtils is used by EventForUpdateSelector
// Remove import for EventForUpdateSelector
import { ConfigurableEventSelector } from './configurable-event-selector'; // Added import for ConfigurableEventSelector
import { EventEligibilityType } from '../utils/event-eligibility.util'; // Added import for EventEligibilityType

/**
 * Handler for updating post-event completion status
 * Allows students to report which path they have completed after their celebration.
 */
export class PostEventUpdateHandler extends BaseYemotHandler {
  // private student: Student | null = null; // Removed student property as it's passed as a parameter
  private eventPersistenceHandler: EventPersistenceHandler;

  constructor(call: Call, dataSource: DataSource) {
    super(call, dataSource);
    this.eventPersistenceHandler = new EventPersistenceHandler(call, dataSource);
  }

  // setStudent(student: Student): void { // Removed setStudent method
  //   this.student = student;
  // }

  async handlePostEventUpdate(student: Student, studentEvents: DBEvent[]): Promise<boolean> { // Added student and studentEvents parameters
    this.logStart('handlePostEventUpdate');

    try {
      if (!student) { // Check the passed student parameter
        this.call.logError('Student not set for PostEventUpdateHandler');
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.ERROR);
        return false;
      }

      // 1. Create an event selector using ConfigurableEventSelector
      const eventSelector = new ConfigurableEventSelector(
        this.call,
        this.dataSource,
        student, // Use the passed student parameter
        studentEvents, // Use the passed studentEvents parameter
        EventEligibilityType.POST_UPDATE,
        true // autoSelectSingleItem
      );

      const selectedEventItem = await eventSelector.handleSingleSelection();

      if (!selectedEventItem) {
        this.call.logInfo('No event selected for update by user or selection failed.');
        // SelectionHelper would have played appropriate messages and hung up if necessary.
        return false;
      }
      const eventToUpdate = selectedEventItem.originalEvent;
      this.call.logInfo(`Proceeding with selected event: ${eventToUpdate.name} (ID: ${eventToUpdate.id})`);

      // 2. Select Completed Path
      // PathSelectionHandler is a SelectionHelper<LevelType>
      const pathSelector = new PathSelectionHandler(this.call, this.dataSource);
      const selectedPath = await pathSelector.handleSingleSelection();

      if (!selectedPath) {
        this.call.logInfo('No path selected by the user or selection process failed.');
        // PathSelectionHandler (via SelectionHelper) would handle messages.
        await this.call.playMessage(MESSAGE_CONSTANTS.PATH.NO_PATH_SELECTED);
        return false;
      }

      // 3. Update Event Completion Status
      await this.eventPersistenceHandler.recordEventCompletion(eventToUpdate, selectedPath);
      await this.call.playMessage(MESSAGE_CONSTANTS.POST_EVENT.UPDATE_SUCCESS);
      this.logComplete('handlePostEventUpdate', {
        eventId: eventToUpdate.id,
        pathId: selectedPath.id,
      });
      return true;
    } catch (error) {
      this.logError('handlePostEventUpdate', error as Error);
      await this.call.hangupWithMessage(MESSAGE_CONSTANTS.POST_EVENT.UPDATE_ERROR);
      return false;
    }
  }
  // The createEventSelector method is no longer needed as we directly instantiate EventForUpdateSelector.
}
