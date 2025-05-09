import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource, IsNull } from "typeorm";
import { BaseYemotHandler } from "../core/base-yemot-handler";
import { Student } from "src/db/entities/Student.entity";
import { Event } from "src/db/entities/Event.entity";
import { CallUtils } from "../utils/call-utils";
import { MESSAGE_CONSTANTS } from "../constants/message-constants";
import { SYSTEM_CONSTANTS } from "../constants/system-constants";

/**
 * Different menu options that can be selected
 */
export enum MenuOption {
  EVENT_REPORTING = '1',
  PATH_SELECTION = '2',
  VOUCHER_SELECTION = '3',
  POST_EVENT_UPDATE = '4',
  EXIT = '9'
}

/**
 * UserInteractionHandler consolidates authentication and menu interaction functionality
 * Handles user authentication and menu selection
 */
export class UserInteractionHandler extends BaseYemotHandler {
  private authenticatedStudent: Student | null = null;
  private selectedMenuOption: MenuOption | null = null;
  private hasEventsForUpdate: boolean = false;
  private hasEventsForPathSelection: boolean = false;
  private hasEventsForVoucherSelection: boolean = false;

  /**
   * Constructor for the UserInteractionHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, call: Call, dataSource: DataSource) {
    super(logger, call, dataSource);
  }

  /**
   * Handles the complete user interaction flow: authentication, event checking, and menu selection.
   * @returns An object containing the authenticated student and the selected menu option, or null if the flow fails.
   */
  async handleUserInteraction(): Promise<{ student: Student; menuOption: MenuOption } | null> {
    this.logStart('handleUserInteraction');

    try {
      // Step 1: Authenticate the user (student)
      const isAuthenticated = await this.authenticateStudent();
      if (!isAuthenticated || !this.authenticatedStudent) {
        this.logger.warn('Authentication failed, ending interaction.');
        // authenticateStudent() handles hangup messages on failure
        return null;
      }

      // Step 2: Check student events (to tailor the menu)
      await this.checkStudentEvents();

      // Step 3: Present the main menu and get selection
      const menuOption = await this.presentMainMenu();
      if (!menuOption) {
        this.logger.warn('No menu option was selected, ending interaction.');
        // presentMainMenu() handles hangup messages on failure (e.g. max attempts)
        return null;
      }

      this.logComplete('handleUserInteraction', {
        studentId: this.authenticatedStudent.id,
        menuSelection: menuOption
      });

      return { student: this.authenticatedStudent, menuOption };
    } catch (error) {
      this.logError('handleUserInteraction', error as Error);
      await CallUtils.hangupWithMessage(
        this.call,
        MESSAGE_CONSTANTS.GENERAL.ERROR,
        this.logger
      );
      return null;
    }
  }

  /**
   * Authenticates the student based on their ID
   * @returns True if authentication succeeds, false otherwise
   */
  private async authenticateStudent(): Promise<boolean> {
    this.logStart('authenticateStudent');

    try {
      // Get the student ID with retry capability
      const student = await this.withRetry(
        async () => {
          const tz = await CallUtils.readDigits(
            this.call,
            MESSAGE_CONSTANTS.AUTHENTICATION.ID_PROMPT,
            this.logger,
            {
              max_digits: SYSTEM_CONSTANTS.MAX_ID_DIGITS,
              min_digits: 5 // Minimum reasonable ID length
            }
          );

          const student = await this.dataSource.getRepository(Student).findOne({
            where: { tz },
          });

          if (!student) {
            this.logger.warn(`Student with ID ${tz} not found`);
            throw new Error('Student not found');
          }

          return student;
        },
        MESSAGE_CONSTANTS.AUTHENTICATION.STUDENT_NOT_FOUND,
        MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED,
      );
      if (!student) {
        this.logger.warn('Failed to authenticate student');
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.GENERAL.ERROR,
          this.logger
        );
        return false;
      }

      // Student authenticated successfully
      this.authenticatedStudent = student;
      this.logger.log(`Student authenticated: ${student.id}, ${student.name}`);

      // Greet the student by name
      await CallUtils.playMessage(
        this.call,
        `שלום ${student.name}, ברוכה הבאה למערכת הדיווח האוטומטית.`,
        this.logger
      );

      this.logComplete('authenticateStudent', { studentId: student.id });
      return true;
    } catch (error) {
      this.logError('authenticateStudent', error as Error);
      return false;
    }
  }

  /**
   * Checks student's events to determine available menu options.
   * Sets flags: `hasEventsForUpdate`, `hasEventsForPathSelection`, `hasEventsForVoucherSelection`.
   */
  public async checkStudentEvents(): Promise<void> {
    this.logStart('checkStudentEvents');
    this.hasEventsForUpdate = false;
    this.hasEventsForPathSelection = false;
    this.hasEventsForVoucherSelection = false;

    if (!this.authenticatedStudent) {
      this.logger.warn('Cannot check student events, student not authenticated.');
      this.logComplete('checkStudentEvents', {
        hasEventsForUpdate: this.hasEventsForUpdate,
        hasEventsForPathSelection: this.hasEventsForPathSelection,
        hasEventsForVoucherSelection: this.hasEventsForVoucherSelection
      });
      return;
    }

    try {
      const eventRepository = this.dataSource.getRepository(Event);
      // Fetch events that are not yet fully completed via post-event update,
      // and load relations needed for logic.
      const events = await eventRepository.find({
        where: {
          studentReferenceId: this.authenticatedStudent.id,
          // completedPathReferenceId: IsNull(), // Consider if this filter is too restrictive for path/voucher
        },
        relations: ['eventGifts', 'levelType'], // levelType for path, eventGifts for vouchers
      });

      if (events.length === 0) {
        this.logger.log(`No events found for student ${this.authenticatedStudent.id} to check for menu options.`);
        this.logComplete('checkStudentEvents', { eventsChecked: 0, hasEventsForUpdate: false, hasEventsForPathSelection: false, hasEventsForVoucherSelection: false });
        return;
      }

      this.logger.log(`Found ${events.length} events for student ${this.authenticatedStudent.id} to check for menu options.`);

      for (const event of events) {
        // Check for Post-Event Update eligibility
        if (event.completedPathReferenceId === null && event.eventDate < new Date()) {
          // Event is not yet marked as completed with a path and the event date is in the past
          this.hasEventsForUpdate = true;
        }

        // Check for Path Selection eligibility
        // An event is eligible if it doesn't have a path selected yet.
        // We also consider only events that are not yet fully completed by post-event update.
        if (event.levelTypeReferenceId === null && event.completedPathReferenceId === null) {
          this.hasEventsForPathSelection = true;
        }

        // Check for Voucher Selection eligibility
        // An event is eligible if a path is selected, it's not fully completed by post-event update,
        // and (for simplicity) it doesn't have vouchers yet or policy allows re-selection.
        // For now, let's say if a path is selected and it's not post-event completed, voucher selection is possible.
        // A more robust check might involve looking at event.eventGifts.length
        if (event.levelTypeReferenceId !== null && event.completedPathReferenceId === null) {
          // To be more precise for "needs vouchers":
          // if (event.levelTypeReferenceId !== null && event.completedPathReferenceId === null && (!event.eventGifts || event.eventGifts.length === 0)) {
          this.hasEventsForVoucherSelection = true;
        }
      }

      this.logger.log(`Student ${this.authenticatedStudent.id} eligibility: Update=${this.hasEventsForUpdate}, Path=${this.hasEventsForPathSelection}, Voucher=${this.hasEventsForVoucherSelection}`);

    } catch (error) {
      this.logError('checkStudentEvents', error as Error);
      // Default to false on error for all flags
      this.hasEventsForUpdate = false;
      this.hasEventsForPathSelection = false;
      this.hasEventsForVoucherSelection = false;
    }
    this.logComplete('checkStudentEvents', {
      hasEventsForUpdate: this.hasEventsForUpdate,
      hasEventsForPathSelection: this.hasEventsForPathSelection,
      hasEventsForVoucherSelection: this.hasEventsForVoucherSelection
    });
  }

  /**
   * Validates the format of the ID input
   * @param id The ID to validate
   * @returns True if the ID is valid
   */
  private validateIdFormat(id: string): boolean {
    // Check that the ID contains only digits
    if (!/^\d+$/.test(id)) {
      this.logger.warn(`Invalid ID format: ${id} - contains non-digit characters`);
      return false;
    }

    // ID should be reasonably sized
    if (id.length < 5 || id.length > SYSTEM_CONSTANTS.MAX_ID_DIGITS) {
      this.logger.warn(`Invalid ID length: ${id.length}`);
      return false;
    }

    return true;
  }

  /**
   * Presents the main menu and gets the user's selection
   * @returns The selected menu option
   */
  private async presentMainMenu(): Promise<MenuOption> {
    this.logStart('presentMainMenu');

    try {
      // Present menu with retry capability
      const selection = await this.withRetry(
        async () => {
          let menuPrompt = MESSAGE_CONSTANTS.MENU.MAIN_MENU_BASE;
          const allowedOptions = [
            MenuOption.EVENT_REPORTING,
            MenuOption.PATH_SELECTION, // Assuming these are always available for now
            MenuOption.VOUCHER_SELECTION, // Assuming these are always available for now
            // MenuOption.EXIT // Exit is usually handled by hangup or a generic "press 9 to exit"
          ];

          menuPrompt += `\nלדיווח על אירוע הקישי ${MenuOption.EVENT_REPORTING}`;
          menuPrompt += `\nלבחירת מסלול ראשונית הקישי ${MenuOption.PATH_SELECTION}`;
          menuPrompt += `\nלבחירת שוברים ראשונית הקישי ${MenuOption.VOUCHER_SELECTION}`;

          if (this.hasEventsForUpdate) {
            menuPrompt += `\nלעדכון פרטי מסלול לאחר אירוע הקישי ${MenuOption.POST_EVENT_UPDATE}`;
            allowedOptions.push(MenuOption.POST_EVENT_UPDATE);
          }
          // menuPrompt += `\nלסיום הקישי ${MenuOption.EXIT}`; // Consider if EXIT should always be an option here

          const menuResponse = await CallUtils.readDigits(
            this.call,
            menuPrompt,
            this.logger,
            {
              max_digits: 1,
              min_digits: 1,
              digits_allowed: allowedOptions
            }
          );

          // Validate menu selection
          if (!allowedOptions.includes(menuResponse as MenuOption)) {
            this.logger.warn(`Invalid menu selection: ${menuResponse}`);
            await CallUtils.playMessage(
              this.call,
              MESSAGE_CONSTANTS.GENERAL.INVALID_INPUT,
              this.logger
            );
            throw new Error('Invalid menu selection');
          }

          return menuResponse as MenuOption;
        },
        MESSAGE_CONSTANTS.GENERAL.INVALID_INPUT,
        MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED
      );

      if (!selection) {
        this.logger.warn('Failed to get a valid menu selection');
        await CallUtils.hangupWithMessage(
          this.call,
          MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED,
          this.logger
        );
        throw new Error('No menu option selected');
      }

      this.selectedMenuOption = selection;
      this.logger.log(`Menu option selected: ${this.selectedMenuOption}`);

      // Confirm menu selection to the user
      let confirmationMessage = '';
      switch (this.selectedMenuOption) {
        case MenuOption.EVENT_REPORTING:
          confirmationMessage = 'בחרת בדיווח על אירוע חדש';
          break;
        case MenuOption.PATH_SELECTION:
          confirmationMessage = 'בחרת בבחירת מסלול';
          break;
        case MenuOption.VOUCHER_SELECTION:
          confirmationMessage = 'בחרת בבחירת שוברים';
          break;
        case MenuOption.POST_EVENT_UPDATE:
          confirmationMessage = 'בחרת בעדכון לאחר אירוע';
          break;
        case MenuOption.EXIT:
          confirmationMessage = 'בחרת לסיים את השיחה';
          break;
      }

      await CallUtils.playMessage(this.call, confirmationMessage, this.logger);

      this.logComplete('presentMainMenu', { selection: this.selectedMenuOption });
      return this.selectedMenuOption;
    } catch (error) {
      this.logError('presentMainMenu', error as Error);
      throw error;
    }
  }

  /**
   * Gets the authenticated student
   * @returns The authenticated student or null if authentication failed
   */
  getAuthenticatedStudent(): Student | null {
    return this.authenticatedStudent;
  }

  /**
   * Gets the selected menu option
   * @returns The selected menu option or null if none was selected
   */
  getSelectedMenuOption(): MenuOption | null {
    return this.selectedMenuOption;
  }
}