import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";
import { YemotHandlerFactoryV2 } from "./yemot-handler-factory-v2";
import { Student } from "src/db/entities/Student.entity";
import { CallUtils } from "../utils/call-utils";
import { MESSAGE_CONSTANTS } from "../constants/message-constants";
import { MenuOption } from "./user-interaction-handler";
import { BaseYemotHandler } from "../core/base-yemot-handler";

/**
 * Orchestrates the call flows using our consolidated handlers
 * This is an updated version of the flow orchestrator that works with our refactored handlers
 */
export class YemotFlowOrchestratorV2 extends BaseYemotHandler {
  private handlerFactory: YemotHandlerFactoryV2;
  private student: Student | null = null;

  /**
   * Constructor for YemotFlowOrchestratorV2
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param handlerFactory Factory for creating handler instances
   */
  constructor(logger: Logger, call: Call, handlerFactory: YemotHandlerFactoryV2) {
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
      // If we hang up here, it might be too soon if there are follow-up actions planned for the orchestrator.
      // For now, let's assume the handler's message is sufficient and the orchestrator just returns.
      // If a hangup is desired here, it should be a generic "thank you" or flow completion message.
      // For now, let's remove the explicit hangup here as the sub-handler manages it.

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

      const eventSelector = this.handlerFactory.createEventForPathAssignmentSelector(
        this.logger,
        this.call,
        this.student
      );
      
      const selectedEventItem = await eventSelector.handleSingleSelection();
      if (!selectedEventItem) {
        this.logger.warn('No event selected for path selection');
        // The selector itself should handle user messages and hangup if needed.
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.EVENT.REPORT_ERROR,
          this.logger // Added missing logger argument
        );
        return; // Correctly placed return
      }
      const eventForPath = selectedEventItem.originalEvent;
      this.logger.log(`Selected event for path selection: ${eventForPath.name} (ID: ${eventForPath.id})`);

      // Use path handler for path selection
      const pathHandler = this.handlerFactory.createPathHandler(
        this.logger,
        this.call
      );

      await pathHandler.handleSingleSelection();
      const selectedPath = pathHandler.getSelectedPath();

      // Confirm path selection
      if (!selectedPath) {
        throw new Error('No path selected');
      }

      if (!this.student) {
        throw new Error('Student is null in executePathSelectionFlow');
      }

      // Save the path to the event using the event persistence handler
      const eventPersistence = this.handlerFactory.createEventPersistenceHandler(this.logger);
      // Correctly pass eventForPath as existingEvent, and null for vouchers
      await eventPersistence.saveEvent(this.student, null, null, selectedPath, null, eventForPath);

      // Option to continue to voucher selection or finish
      const continueToVouchers = await CallUtils.getConfirmation(
        this.call,
        MESSAGE_CONSTANTS.PATH.CONTINUE_TO_VOUCHERS,
        this.logger
      );

      if (continueToVouchers) {
        await this.executeVoucherSelectionFlow();
      } else {
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.PATH.SELECTION_SUCCESS,
          this.logger
        );
      }

    } catch (error) {
      this.logError('executePathSelectionFlow', error as Error);
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
   */
  async executeVoucherSelectionFlow(): Promise<void> {
    this.logStart('executeVoucherSelectionFlow');

    try {
      if (!this.student) {
        this.logger.error('Student is null, cannot proceed with voucher selection flow.');
        await CallUtils.hangupWithMessage(this.call, MESSAGE_CONSTANTS.GENERAL.ERROR, this.logger);
        return;
      }

      // 1. Select an event for voucher assignment
      const eventSelector = this.handlerFactory.createEventForVoucherAssignmentSelector(
        this.logger,
        this.call,
        this.student
      );
      const selectedEventItem = await eventSelector.handleSingleSelection();

      if (!selectedEventItem) {
        this.logger.warn('No event selected for voucher assignment. Ending voucher flow.');
        // Selector should handle messages.
        return;
      }
      const eventForVouchers = selectedEventItem.originalEvent;
      this.logger.log(`Selected event for voucher assignment: ${eventForVouchers.name} (ID: ${eventForVouchers.id})`);

      // 2. Use voucher handler for voucher selection
      const voucherHandler = this.handlerFactory.createVoucherHandler(
        this.logger,
        this.call
      );

      await voucherHandler.handleMultiSelection();
      const selectedVouchers = voucherHandler.getSelectedVouchers();

      if (!this.student) {
        throw new Error('Student is null in executeVoucherSelectionFlow');
      }

      // Only save if the selection was confirmed
      if (voucherHandler.isSelectionConfirmed() || selectedVouchers.length === 0) {
        // Save the vouchers to the event using the event persistence handler
        const eventPersistence = this.handlerFactory.createEventPersistenceHandler(this.logger);
        // Correctly pass eventForVouchers as existingEvent and selectedVouchers for vouchers
        await eventPersistence.saveEvent(this.student, null, null, null, selectedVouchers, eventForVouchers);

        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.VOUCHER.SELECTION_SUCCESS,
          this.logger
        );
      } else {
        this.logger.warn('Voucher selection was not confirmed by user');
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.VOUCHER.SELECTION_NOT_CONFIRMED,
          this.logger
        );
      }

    } catch (error) {
      this.logError('executeVoucherSelectionFlow', error as Error);
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
      // Use the new PostEventUpdateHandlerV2
      const postEventUpdateHandler = this.handlerFactory.createPostEventUpdateHandlerV2(this.logger, this.call);

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
        // No explicit hangup here unless a specific final message is needed for this flow.
      } else {
        this.logger.log('Post-event update flow did not complete successfully or was aborted by user.');
        // Handler should have played appropriate messages.
      }

    } catch (error) {
      this.logError('executePostCelebrationUpdateFlow', error as Error);
      await CallUtils.hangupWithMessage(
        this.call,
        MESSAGE_CONSTANTS.POST_EVENT.UPDATE_ERROR,
        this.logger
      );
    }
  }
}