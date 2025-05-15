import { Logger } from '@nestjs/common';
import { Call } from 'yemot-router2';
import { id_list_message_with_hangup } from '@shared/utils/yemot/yemot-router';
import { YemotHandlerFactory } from './yemot-handler-factory';
import { Student } from 'src/db/entities/Student.entity';
import { Event as DBEvent } from 'src/db/entities/Event.entity';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';
import { MenuOption } from './user-interaction-handler';
import { BaseYemotHandler } from '../core/base-yemot-handler';
import { User } from '@shared/entities/User.entity';

/**
 * Orchestrates the call flows using our consolidated handlers
 * This is an updated version of the flow orchestrator that works with our refactored handlers
 */
export class YemotFlowOrchestrator extends BaseYemotHandler {
  private handlerFactory: YemotHandlerFactory;
  private student: Student | null = null;
  private studentEvents: DBEvent[] = [];

  /**
   * Constructor for YemotFlowOrchestrator
   * @param call The Yemot call object
   * @param handlerFactory Factory for creating handler instances
   */
  constructor(call: Call, handlerFactory: YemotHandlerFactory) {
    super(call);
    this.handlerFactory = handlerFactory;
  }

  /**
   * Executes the main call flow
   * Authenticates the student and presents the main menu
   * Uses the enhanced ExtendedCall for centralized data access and context management
   */
  async execute(): Promise<void> {
    this.call.logInfo('Starting call flow execution');

    try {
      // Step 0: Get user from context (should already be loaded)
      const user = this.call.getContext<User>('user');
      if (!user) {
        this.call.logWarn('User not found in context, attempting to find user');
        const foundUser = await this.call.findUserByPhone();
        if (!foundUser) {
          await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.USER_NOT_FOUND);
          return;
        }
      }

      // Step 1: Handle student identification and menu interaction
      const userInteractionHandler = this.handlerFactory.createUserInteractionHandler();
      const interactionResult = await userInteractionHandler.handleUserInteraction();

      if (!interactionResult) {
        this.call.logWarn('User interaction failed (authentication or menu selection), ending call flow.');
        return;
      }

      // Get student and events from context instead of storing locally
      // This allows other handlers to access the same data
      this.student = this.call.getContext<Student>('student');
      this.studentEvents = this.call.getContext<DBEvent[]>('events');
      const menuOption = interactionResult.menuOption;

      this.call.logInfo(`Student ${this.student.id} selected menu option: ${menuOption}`);

      // Step 2: Handle the selected menu option
      switch (menuOption) {
        case MenuOption.EVENT_REPORTING:
          // Report celebration flow
          await this.executeReportCelebrationFlow();
          break;
        case MenuOption.PATH_SELECTION:
          // Choose path/track
          await this.executePathSelectionFlow();
          break;
        case MenuOption.VOUCHER_SELECTION:
          // Choose vouchers
          await this.executeVoucherSelectionFlow();
          break;
        case MenuOption.POST_EVENT_UPDATE:
          // Update after celebration
          await this.executePostCelebrationUpdateFlow();
          break;
        // case MenuOption.EXIT: // Handle exit if it's an explicit option
        //   await this.call.hangupWithMessage("תודה ולהתראות.");
        //   break;
        default:
          this.call.logError(`Invalid menu choice: ${menuOption}`);
          await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.ERROR);
      }
    } catch (error) {
      this.logError('execute', error as Error);
      // The error handling would have been done in the specific flow
    }
  }

  /**
   * Executes the report celebration flow
   * Creates a new event with event type and date
   */
  async executeReportCelebrationFlow(): Promise<void> {
    this.logStart('executeReportCelebrationFlow');

    try {
      // Use our consolidated EventRegistrationHandler
      // This replaces event type selection, date handling, and existence checking
      if (!this.student) {
        // Check student before creating handler that requires it
        this.call.logError('Student is null, cannot proceed with event registration.');
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.ERROR);
        return;
      }

      const eventRegistrationHandler = this.handlerFactory.createEventRegistrationHandler(this.student);

      // Handle the entire event registration process including:
      // 1. Event type selection
      // 2. Date selection
      // 3. Check for existing events
      // 4. Voucher selection (new step)
      // 5. Create event with vouchers
      const registrationResult = await eventRegistrationHandler.handleEventRegistration();

      if (!registrationResult) {
        // The handler will already have informed the user about any issues or hung up.
        this.call.logWarn('Event registration did not complete successfully.');
        return;
      }

      // The registrationResult contains the created event, eventType, date, and vouchers.
      // The event is already saved by EventRegistrationHandler.createEvent() with vouchers if selected

      const voucherCount = registrationResult.vouchers?.length || 0;
      this.call.logInfo(
        `Event ${registrationResult.event?.id} registered successfully through handler with ${voucherCount} vouchers.`,
      );

      // The EventRegistrationHandler.createEvent() method already plays SAVE_SUCCESS.
      // Orchestrator is responsible for final success message and hangup.
      await this.call.hangupWithMessage(MESSAGE_CONSTANTS.EVENT.SAVE_SUCCESS);
    } catch (error) {
      this.logError('executeReportCelebrationFlow', error as Error);
      await this.call.hangupWithMessage(MESSAGE_CONSTANTS.EVENT.REPORT_ERROR);
    }
  }

  /**
   * Executes the path selection flow
   * Allows selecting a path/track for an existing event
   */
  async executePathSelectionFlow(): Promise<void> {
    this.logStart('executePathSelectionFlow');

    try {
      if (!this.student) {
        this.call.logError('Student is null, cannot proceed with path selection flow.');
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.ERROR);
        return;
      }

      // 1. Select an event for path assignment (auto-select if only one event)
      const eventSelector = this.handlerFactory.createEventForPathAssignmentSelector(this.student, this.studentEvents);

      const selectedEventItem = await eventSelector.handleSingleSelection();
      if (!selectedEventItem) {
        this.call.logWarn('No event selected for path selection');
        // The selector itself should handle user messages and hangup if needed.
        // Orchestrator is responsible for final error message and hangup if selector doesn't.
        await this.call.hangupWithMessage(
          MESSAGE_CONSTANTS.PATH.SELECTION_ERROR, // Use a more specific error message
        );
        return;
      }
      const eventForPath = selectedEventItem.originalEvent;
      this.call.logInfo(`Selected event for path selection: ${eventForPath.name} (ID: ${eventForPath.id})`);

      // 2. Use path handler for path selection (no auto-select for paths)
      const pathHandler = this.handlerFactory.createPathHandler();

      await pathHandler.handleSingleSelection();
      const selectedPath = pathHandler.getSelectedPath();

      // Confirm path selection
      if (!selectedPath) {
        this.call.logWarn('No path selected by user.');
        await this.call.hangupWithMessage(
          MESSAGE_CONSTANTS.PATH.NO_PATH_SELECTED, // Use a more specific error message
        );
        return;
      }

      if (!this.student) {
        throw new Error('Student is null in executePathSelectionFlow'); // Should not happen if we passed student earlier
      }

      // 3. Save the path to the event using the event persistence handler
      const eventPersistence = this.handlerFactory.createEventPersistenceHandler();
      // Correctly pass eventForPath as existingEvent, and null for vouchers
      const updatedEvent = await eventPersistence.saveEvent(this.student, null, null, selectedPath, null, eventForPath);

      // Update the event in our local array with the new data
      const eventIndex = this.studentEvents.findIndex((e) => e.id === updatedEvent.id);
      if (eventIndex !== -1) {
        this.studentEvents[eventIndex] = updatedEvent;
      }

      // Option to continue to voucher selection or finish
      const continueToVouchers = await this.call.getConfirmation(MESSAGE_CONSTANTS.PATH.CONTINUE_TO_VOUCHERS);

      if (continueToVouchers) {
        await this.executeVoucherSelectionFlow(updatedEvent);
      } else {
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.PATH.SELECTION_SUCCESS);
      }
    } catch (error) {
      this.logError('executePathSelectionFlow', error as Error);
      // Generic error message for unexpected errors
      await this.call.hangupWithMessage(MESSAGE_CONSTANTS.PATH.SELECTION_ERROR);
    }
  }

  /**
   * Executes the voucher selection flow
   * Allows selecting vouchers for an existing event
   * @param selectedEvent Optional: An event that was already selected in a previous step (e.g., path selection)
   */
  async executeVoucherSelectionFlow(selectedEvent: DBEvent | null = null): Promise<void> {
    this.logStart('executeVoucherSelectionFlow');

    try {
      if (!this.student) {
        this.call.logError('Student is null, cannot proceed with voucher selection flow.');
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.ERROR);
        return;
      }

      let eventForVouchers: DBEvent;

      if (selectedEvent) {
        // Use the event passed from a previous step
        eventForVouchers = selectedEvent;
        this.call.logInfo(
          `Using pre-selected event for voucher assignment: ${eventForVouchers.name} (ID: ${eventForVouchers.id})`,
        );
      } else {
        // 1. Select an event for voucher assignment (auto-select if only one event)
        const eventSelector = this.handlerFactory.createEventForVoucherAssignmentSelector(
          this.student,
          this.studentEvents,
        );
        const selectedEventItem = await eventSelector.handleSingleSelection();

        if (!selectedEventItem) {
          this.call.logWarn('No event selected for voucher assignment. Ending voucher flow.');
          // Selector should handle messages.
          // Orchestrator is responsible for final error message and hangup if selector doesn't.
          await this.call.hangupWithMessage(
            MESSAGE_CONSTANTS.VOUCHER.SELECTION_ERROR, // Use a more specific error message
          );
          return;
        }
        eventForVouchers = selectedEventItem.originalEvent;
        this.call.logInfo(
          `Selected event for voucher assignment: ${eventForVouchers.name} (ID: ${eventForVouchers.id})`,
        );
      }

      // 2. Use voucher handler for voucher selection (no auto-select for vouchers)
      const voucherHandler = this.handlerFactory.createVoucherHandler();

      await voucherHandler.handleMultiSelection();
      const selectedVouchers = voucherHandler.getSelectedVouchers();

      if (!this.student) {
        throw new Error('Student is null in executeVoucherSelectionFlow'); // Should not happen
      }

      // 3. Only save if the selection was confirmed by the handler
      if (voucherHandler.isSelectionConfirmed() || selectedVouchers.length === 0) {
        // Save the vouchers to the event using the event persistence handler
        const eventPersistence = this.handlerFactory.createEventPersistenceHandler();
        // Correctly pass eventForVouchers as existingEvent and selectedVouchers for vouchers
        const updatedEvent = await eventPersistence.saveEvent(
          this.student,
          null,
          null,
          null,
          selectedVouchers,
          eventForVouchers,
        );

        // Update the event in our local array with the new data
        const eventIndex = this.studentEvents.findIndex((e) => e.id === updatedEvent.id);
        if (eventIndex !== -1) {
          this.studentEvents[eventIndex] = updatedEvent;
        }

        // 4. Orchestrator plays final success message and hangs up
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.VOUCHER.SELECTION_SUCCESS);
      } else {
        this.call.logWarn('Voucher selection was not confirmed by user');
        // Handler should have played the "retry selection" message.
        // Orchestrator plays the final "not confirmed" message and hangs up.
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.VOUCHER.SELECTION_NOT_CONFIRMED);
      }
    } catch (error) {
      this.logError('executeVoucherSelectionFlow', error as Error);
      // Generic error message for unexpected errors
      await this.call.hangupWithMessage(MESSAGE_CONSTANTS.VOUCHER.SELECTION_ERROR);
    }
  }

  /**
   * Executes the post-celebration update flow
   * Allows updating event details after it has occurred
   */
  async executePostCelebrationUpdateFlow(): Promise<void> {
    this.logStart('executePostCelebrationUpdateFlow');

    try {
      // Use the new PostEventUpdateHandler
      const postEventUpdateHandler = this.handlerFactory.createPostEventUpdateHandler();

      if (!this.student) {
        this.call.logError('Student is null, cannot proceed with post-celebration update.');
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.ERROR);
        return;
      }

      // Pass student and studentEvents to the handler
      const flowCompletedSuccessfully = await postEventUpdateHandler.handlePostEventUpdate(this.student, this.studentEvents);

      if (flowCompletedSuccessfully) {
        this.call.logInfo('Post-event update flow completed successfully.');
        // The handler itself plays success/error messages and can hang up.
        // Orchestrator plays the final success message and hangs up.
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.POST_EVENT.UPDATE_SUCCESS);
      } else {
        this.call.logInfo('Post-event update flow did not complete successfully or was aborted by user.');
        // Handler should have played appropriate messages.
        // Orchestrator plays the final error message and hangs up if the handler didn't.
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.POST_EVENT.UPDATE_ERROR);
      }
    } catch (error) {
      this.logError('executePostCelebrationUpdateFlow', error as Error);
      // Generic error message for unexpected errors
      await this.call.hangupWithMessage(MESSAGE_CONSTANTS.POST_EVENT.UPDATE_ERROR);
    }
  }
}
