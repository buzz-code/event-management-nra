import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";
import { YemotHandlerFactory } from "./yemot-handler-factory";
import { Student } from "src/db/entities/Student.entity";
import { Event as DBEvent } from "src/db/entities/Event.entity";
import { CallUtils } from "../utils/call-utils";
import { MESSAGE_CONSTANTS } from "../constants/message-constants";
import { MenuOption } from "./user-interaction-handler";
import { BaseYemotHandler } from "../core/base-yemot-handler";

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
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param handlerFactory Factory for creating handler instances
   */
  constructor(logger: Logger, call: Call, handlerFactory: YemotHandlerFactory) {
    super(logger, call);
    this.handlerFactory = handlerFactory;
  }

  /**
   * Executes the main call flow
   * Authenticates the student and presents the main menu
   */
  async execute(): Promise<void> {
    this.logStart('execute');

    try {
      // Step 1: Handle student identification and menu interaction
      // This consolidates the previous authentication and menu presentation steps
      const userInteractionHandler = this.handlerFactory.createUserInteractionHandler(
        this.logger,
        this.call
      );

      const interactionResult = await userInteractionHandler.handleUserInteraction();
      
      if (interactionResult) {
        this.student = interactionResult.student;
        // Get the student's events using the proper method
        this.studentEvents = userInteractionHandler.getStudentEvents();
      }

      if (!interactionResult) {
        this.logger.warn('User interaction failed (authentication or menu selection), ending call flow.');
        // Specific messages and hangup should be handled within UserInteractionHandler
        return;
      }

      this.student = interactionResult.student;
      const menuOption = interactionResult.menuOption;

      this.logger.log(`Student ${this.student.id} selected menu option: ${menuOption}`);

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
        //   await CallUtils.hangupWithMessage(this.call, "תודה ולהתראות.", this.logger);
        //   break;
        default:
          this.logger.error(`Invalid menu choice: ${menuOption}`);
          await CallUtils.hangupWithMessage(
            this.call,
            MESSAGE_CONSTANTS.GENERAL.ERROR,
            this.logger
          );
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
      if (!this.student) { // Check student before creating handler that requires it
        this.logger.error('Student is null, cannot proceed with event registration.');
        await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.GENERAL.ERROR, this.logger);
        return;
      }

      const eventRegistrationHandler = this.handlerFactory.createEventRegistrationHandler(
        this.logger,
        this.call,
        this.student // Pass the authenticated student
      );

      // Handle the entire event registration process
      // The student is now passed to the constructor of EventRegistrationHandler
      const registrationResult = await eventRegistrationHandler.handleEventRegistration();

      if (!registrationResult) {
        // The handler will already have informed the user about any issues or hung up.
        this.logger.warn('Event registration did not complete successfully.');
        return;
      }

      // The registrationResult contains the created event, eventType, and date.
      // The event is already saved by EventRegistrationHandler.createEvent()
      // No need to call eventPersistence.saveEvent() here for the initial creation.
      // If further updates were needed, we could use registrationResult.event.

      this.logger.log(`Event ${registrationResult.event?.id} registered successfully through handler.`);
      // The EventRegistrationHandler.createEvent() method already plays SAVE_SUCCESS.
      // Orchestrator is responsible for final success message and hangup.
      await CallUtils.hangupWithMessage(
        this.call,
        MESSAGE_CONSTANTS.EVENT.SAVE_SUCCESS,
        this.logger
      );

    } catch (error) {
      this.logError('executeReportCelebrationFlow', error as Error);
      await CallUtils.hangupWithMessage(
        this.call,
        MESSAGE_CONSTANTS.EVENT.REPORT_ERROR,
        this.logger
      );
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
        this.logger.error('Student is null, cannot proceed with path selection flow.');
        await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.GENERAL.ERROR, this.logger);
        return;
      }

      // 1. Select an event for path assignment (auto-select if only one event)
      const eventSelector = this.handlerFactory.createEventForPathAssignmentSelector(
        this.logger,
        this.call,
        this.student,
        this.studentEvents
      );
      
      const selectedEventItem = await eventSelector.handleSingleSelection();
      if (!selectedEventItem) {
        this.logger.warn('No event selected for path selection');
        // The selector itself should handle user messages and hangup if needed.
        // Orchestrator is responsible for final error message and hangup if selector doesn't.
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.PATH.SELECTION_ERROR, // Use a more specific error message
          this.logger
        );
        return;
      }
      const eventForPath = selectedEventItem.originalEvent;
      this.logger.log(`Selected event for path selection: ${eventForPath.name} (ID: ${eventForPath.id})`);

      // 2. Use path handler for path selection (no auto-select for paths)
      const pathHandler = this.handlerFactory.createPathHandler(
        this.logger,
        this.call
      );

      await pathHandler.handleSingleSelection();
      const selectedPath = pathHandler.getSelectedPath();

      // Confirm path selection
      if (!selectedPath) {
        this.logger.warn('No path selected by user.');
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.PATH.NO_PATH_SELECTED, // Use a more specific error message
          this.logger
        );
        return;
      }

      if (!this.student) {
        throw new Error('Student is null in executePathSelectionFlow'); // Should not happen if we passed student earlier
      }

      // 3. Save the path to the event using the event persistence handler
      const eventPersistence = this.handlerFactory.createEventPersistenceHandler(this.logger);
      // Correctly pass eventForPath as existingEvent, and null for vouchers
      const updatedEvent = await eventPersistence.saveEvent(this.student, null, null, selectedPath, null, eventForPath);

      // Update the event in our local array with the new data
      const eventIndex = this.studentEvents.findIndex(e => e.id === updatedEvent.id);
      if (eventIndex !== -1) {
        this.studentEvents[eventIndex] = updatedEvent;
      }

      // Option to continue to voucher selection or finish
      const continueToVouchers = await CallUtils.getConfirmation(
        this.call,
        MESSAGE_CONSTANTS.PATH.CONTINUE_TO_VOUCHERS,
        this.logger
      );

      if (continueToVouchers) {
        await this.executeVoucherSelectionFlow(updatedEvent);
      } else {
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.PATH.SELECTION_SUCCESS,
          this.logger
        );
      }

    } catch (error) {
      this.logError('executePathSelectionFlow', error as Error);
      // Generic error message for unexpected errors
      await CallUtils.hangupWithMessage(
        this.call,
        MESSAGE_CONSTANTS.PATH.SELECTION_ERROR,
        this.logger
      );
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
        this.logger.error('Student is null, cannot proceed with voucher selection flow.');
        await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.GENERAL.ERROR, this.logger);
        return;
      }

      let eventForVouchers: DBEvent;

      if (selectedEvent) {
        // Use the event passed from a previous step
        eventForVouchers = selectedEvent;
        this.logger.log(`Using pre-selected event for voucher assignment: ${eventForVouchers.name} (ID: ${eventForVouchers.id})`);
      } else {
        // 1. Select an event for voucher assignment (auto-select if only one event)
        const eventSelector = this.handlerFactory.createEventForVoucherAssignmentSelector(
          this.logger,
          this.call,
          this.student,
          this.studentEvents
        );
        const selectedEventItem = await eventSelector.handleSingleSelection();

        if (!selectedEventItem) {
          this.logger.warn('No event selected for voucher assignment. Ending voucher flow.');
          // Selector should handle messages.
          // Orchestrator is responsible for final error message and hangup if selector doesn't.
          await CallUtils.hangupWithMessage(
            this.call,
            MESSAGE_CONSTANTS.VOUCHER.SELECTION_ERROR, // Use a more specific error message
            this.logger
          );
          return;
        }
        eventForVouchers = selectedEventItem.originalEvent;
        this.logger.log(`Selected event for voucher assignment: ${eventForVouchers.name} (ID: ${eventForVouchers.id})`);
      }

      // 2. Use voucher handler for voucher selection (no auto-select for vouchers)
      const voucherHandler = this.handlerFactory.createVoucherHandler(
        this.logger,
        this.call
      );

      await voucherHandler.handleMultiSelection();
      const selectedVouchers = voucherHandler.getSelectedVouchers();

      if (!this.student) {
        throw new Error('Student is null in executeVoucherSelectionFlow'); // Should not happen
      }

      // 3. Only save if the selection was confirmed by the handler
      if (voucherHandler.isSelectionConfirmed() || selectedVouchers.length === 0) {
        // Save the vouchers to the event using the event persistence handler
        const eventPersistence = this.handlerFactory.createEventPersistenceHandler(this.logger);
        // Correctly pass eventForVouchers as existingEvent and selectedVouchers for vouchers
        const updatedEvent = await eventPersistence.saveEvent(this.student, null, null, null, selectedVouchers, eventForVouchers);

        // Update the event in our local array with the new data
        const eventIndex = this.studentEvents.findIndex(e => e.id === updatedEvent.id);
        if (eventIndex !== -1) {
          this.studentEvents[eventIndex] = updatedEvent;
        }

        // 4. Orchestrator plays final success message and hangs up
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.VOUCHER.SELECTION_SUCCESS,
          this.logger
        );
      } else {
        this.logger.warn('Voucher selection was not confirmed by user');
        // Handler should have played the "retry selection" message.
        // Orchestrator plays the final "not confirmed" message and hangs up.
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.VOUCHER.SELECTION_NOT_CONFIRMED,
          this.logger
        );
      }

    } catch (error) {
      this.logError('executeVoucherSelectionFlow', error as Error);
      // Generic error message for unexpected errors
      await CallUtils.hangupWithMessage(
        this.call,
        MESSAGE_CONSTANTS.VOUCHER.SELECTION_ERROR,
        this.logger
      );
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
      const postEventUpdateHandler = this.handlerFactory.createPostEventUpdateHandler(this.logger, this.call);

      if (!this.student) {
        this.logger.error('Student is null, cannot proceed with post-celebration update.');
        await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.GENERAL.ERROR, this.logger);
        return;
      }

      postEventUpdateHandler.setStudent(this.student);
      const flowCompletedSuccessfully = await postEventUpdateHandler.handlePostEventUpdate();

      if (flowCompletedSuccessfully) {
        this.logger.log('Post-event update flow completed successfully.');
        // The handler itself plays success/error messages and can hang up.
        // Orchestrator plays the final success message and hangs up.
        await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.POST_EVENT.UPDATE_SUCCESS, this.logger);
      } else {
        this.logger.log('Post-event update flow did not complete successfully or was aborted by user.');
        // Handler should have played appropriate messages.
        // Orchestrator plays the final error message and hangs up if the handler didn't.
        await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.POST_EVENT.UPDATE_ERROR, this.logger);
      }

    } catch (error) {
      this.logError('executePostCelebrationUpdateFlow', error as Error);
      // Generic error message for unexpected errors
      await CallUtils.hangupWithMessage(
        this.call,
        MESSAGE_CONSTANTS.POST_EVENT.UPDATE_ERROR,
        this.logger
      );
    }
  }
}