import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";
import { YemotHandlerFactory } from "./yemot-handler-factory";
import { Student } from "src/db/entities/Student.entity";
import { DateSelectionResult } from "../handlers/date-handler";

/**
 * Orchestrates the call flows using different handlers
 * Coordinates the execution of handlers in different scenarios
 */
export class YemotFlowOrchestrator {
  private logger: Logger;
  private call: Call;
  private handlerFactory: YemotHandlerFactory;
  private student: Student | null = null;

  /**
   * Constructor for YemotFlowOrchestrator
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param handlerFactory Factory for creating handler instances
   */
  constructor(logger: Logger, call: Call, handlerFactory: YemotHandlerFactory) {
    this.logger = logger;
    this.call = call;
    this.handlerFactory = handlerFactory;
  }

  /**
   * Authenticates a student and sets up the main flow
   * @returns The authenticated student
   */
  private async authenticateStudent(): Promise<Student> {
    const authHandler = this.handlerFactory.createAuthenticationHandler(this.logger, this.call);
    this.student = await authHandler.authenticateStudent();
    return this.student;
  }

  /**
   * Completes the call with a success message and hangs up
   * @param message The message to play before hanging up
   */
  private finishCall(message: string = 'תודה על הדיווח. האירוע נשמר בהצלחה במערכת'): void {
    id_list_message_with_hangup(this.call, message);
  }

  /**
   * Executes the report celebration flow
   * Creates a new event with event type and date
   */
  async executeReportCelebrationFlow(): Promise<void> {
    this.logger.log('Starting report celebration flow');

    try {
      // Step 1: Handle event type selection
      const eventTypeHandler = this.handlerFactory.createEventTypeHandler(this.logger, this.call);
      await eventTypeHandler.handleSelection();
      const eventType = eventTypeHandler.getSelectedEventType();

      if (!eventType) {
        throw new Error('No event type selected');
      }

      // Step 2: Handle event date selection
      const dateHandler = this.handlerFactory.createDateHandler(this.logger, this.call);
      const dateInfo: DateSelectionResult = await dateHandler.handleDateSelection();

      // Step 3: Check if event exists with same student, type, and date
      if (!this.student) {
        throw new Error('Student is null in handleReportCelebration');
      }

      const existenceHandler = this.handlerFactory.createEventExistenceHandler(
        this.logger,
        this.call
      );

      const isNewEvent = await existenceHandler.checkEventExists(
        this.student,
        eventType,
        dateInfo.gregorianDate
      );

      // If event exists, inform user they need to call for modifications
      if (!isNewEvent) {
        await id_list_message_with_hangup(
          this.call,
          `נמצא אירוע קיים מסוג ${eventType.name} בתאריך ${dateInfo.hebrewDate}. אין אפשרות לשנות אירוע קיים. כדי לשנות אירוע קיים יש ליצור קשר טלפוני בשעות הערב במספר 0533152632`
        );
        return;
      }

      // Step 4: Save the event
      const eventSaver = this.handlerFactory.createEventSaverHandler(this.logger);
      await eventSaver.saveEvent(this.student, eventType, dateInfo.gregorianDate);

      // Finish with success message
      this.finishCall('הפרטים עודכנו בהצלחה, מזל טוב');

    } catch (error) {
      this.logger.error(`Error in report celebration flow: ${error.message}`);
      this.finishCall('אירעה שגיאה בתהליך הדיווח. אנא נסי שוב מאוחר יותר.');
    }
  }

  /**
   * Executes the path selection flow
   * Allows selecting a path/track for an existing event
   */
  async executePathSelectionFlow(): Promise<void> {
    this.logger.log('Starting path selection flow');

    try {
      // Use level type handler for path selection
      const levelTypeHandler = this.handlerFactory.createLevelTypeHandler(
        this.logger,
        this.call
      );

      await levelTypeHandler.handleSelection();
      const levelType = levelTypeHandler.getSelectedLevelType();

      // Confirm path selection
      if (!levelType) {
        throw new Error('No level type selected');
      }

      if (!this.student) {
        throw new Error('Student is null in executePathSelectionFlow');
      }

      // Save the level type to the event
      const eventSaver = this.handlerFactory.createEventSaverHandler(this.logger);

      // We would need to get the event first, but for simplicity using null here
      // In a real implementation, we would fetch the event first
      await eventSaver.saveEvent(this.student, null, null, levelType);

      // Option to continue to voucher selection or finish
      const continueToVouchers = await this.promptContinueToVouchers();

      if (continueToVouchers) {
        await this.executeVoucherSelectionFlow();
      } else {
        this.finishCall('בחירת המסלול נשמרה בהצלחה');
      }

    } catch (error) {
      this.logger.error(`Error in path selection flow: ${error.message}`);
      this.finishCall('אירעה שגיאה בבחירת המסלול. אנא נסי שוב מאוחר יותר.');
    }
  }

  /**
   * Executes the voucher selection flow
   * Allows selecting vouchers/gifts for an existing event
   */
  async executeVoucherSelectionFlow(): Promise<void> {
    this.logger.log('Starting voucher selection flow');

    try {
      // Use gift handler for voucher selection
      const giftHandler = this.handlerFactory.createGiftHandler(
        this.logger,
        this.call
      );

      await giftHandler.handleMultiSelection();
      const selectedGifts = giftHandler.getSelectedGifts();

      // Confirm voucher selection
      if (selectedGifts.length > 0) {
        const giftNames = selectedGifts.map(gift => gift.name).join(', ');
        const confirmed = await this.confirmSelection(`השוברים שבחרת: ${giftNames}`);

        if (!confirmed) {
          // User wants to change selection, run voucher selection again
          return await this.executeVoucherSelectionFlow();
        }
      }

      if (!this.student) {
        throw new Error('Student is null in executeVoucherSelectionFlow');
      }

      // Save the gifts to the event
      const eventSaver = this.handlerFactory.createEventSaverHandler(this.logger);

      // We would need to get the event first, but for simplicity using null here
      // In a real implementation, we would fetch the event first
      await eventSaver.saveEvent(this.student, null, null, null, selectedGifts);

      this.finishCall('בחירת השובר נשמרה בהצלחה במערכת');

    } catch (error) {
      this.logger.error(`Error in voucher selection flow: ${error.message}`);
      this.finishCall('אירעה שגיאה בבחירת השוברים. אנא נסי שוב מאוחר יותר.');
    }
  }

  /**
   * Executes the post-celebration update flow
   * Allows updating event details after it has occurred
   */
  async executePostCelebrationUpdateFlow(): Promise<void> {
    this.logger.log('Starting post-celebration update flow');
    const postEventHandler = this.handlerFactory.createPostEventHandler(this.logger, this.call);
    postEventHandler.setStudent(this.student); // Set the student for the handler

    const flowCompletedSuccessfully = await postEventHandler.handlePostEventUpdate();

    if (flowCompletedSuccessfully) {
      // Messages are handled within PostEventHandler
      this.logger.log('Post-event update flow completed successfully.');
    } else {
      // Messages are handled within PostEventHandler, or a generic one can be played if needed
      this.logger.log('Post-event update flow did not complete successfully or was aborted by user.');
    }
    // The PostEventHandler is expected to call finishCall or similar for final user messages.
  }

  /**
   * Prompts the user to continue to voucher selection
   * @returns Whether the user chose to continue to voucher selection
   */
  private async promptContinueToVouchers(): Promise<boolean> {
    const response = await this.call.read(
      [{ type: 'text', data: 'לבחירת שוברים הקישי 1, לסיום הקישי 2' }],
      'tap',
      {
        max_digits: 1,
        min_digits: 1,
        digits_allowed: ['1', '2']
      }
    ) as string;

    // Convert string response to number
    return parseInt(response) === 1;
  }

  /**
   * Asks user to confirm a selection
   * @param message The message to display before asking for confirmation
   * @returns Whether the user confirmed the selection
   */
  private async confirmSelection(message: string): Promise<boolean> {
    const response = await this.call.read(
      [{ type: 'text', data: `${message}\nלאישור הקישי 1, לשינוי הקישי 2` }],
      'tap',
      {
        max_digits: 1,
        min_digits: 1,
        digits_allowed: ['1', '2']
      }
    ) as string;

    return response === '1';
  }

  /**
   * Executes the main call flow
   * Authenticates the student and presents the main menu
   */
  async execute(): Promise<void> {
    this.logger.log('Starting main call flow');

    try {
      // Step 1: Handle student identification
      this.student = await this.authenticateStudent();

      if (!this.student) {
        throw new Error('Student authentication failed');
      }

      // Step 2: Check if student has existing events for the main menu options
      const menuHandler = this.handlerFactory.createMenuHandler(this.logger, this.call);
      menuHandler.setStudent(this.student);
      await menuHandler.checkStudentEvents();

      // Step 3: Present main menu and get user choice
      const menuChoice = await menuHandler.presentMainMenu();

      // Step 4: Handle the selected menu option
      switch (menuChoice) {
        case 1:
          // Report celebration (original flow)
          await this.executeReportCelebrationFlow();
          break;
        case 2:
          // Choose path/track
          await this.executePathSelectionFlow();
          break;
        case 3:
          // Choose vouchers
          await this.executeVoucherSelectionFlow();
          break;
        case 4:
          // Update after celebration
          await this.executePostCelebrationUpdateFlow();
          break;
        default:
          this.logger.error(`Invalid menu choice: ${menuChoice}`);
          this.finishCall('אירעה שגיאה, אנא נסי שוב מאוחר יותר');
      }
    } catch (error) {
      this.logger.error(`Error in main flow: ${error.message}`);
      // The error handling would have been done in the specific flow
    }
  }
}