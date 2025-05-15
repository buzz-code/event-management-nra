import { Logger } from '@nestjs/common';
import { Call } from 'yemot-router2';
import { DataSource, IsNull } from 'typeorm';
import { BaseYemotHandler } from '../core/base-yemot-handler';
import { Student } from 'src/db/entities/Student.entity';
import { Event as DBEvent } from 'src/db/entities/Event.entity';
import { EventEligibilityUtil } from '../utils/event-eligibility.util';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';
import { SYSTEM_CONSTANTS } from '../constants/system-constants';

/**
 * Different menu options that can be selected
 */
export enum MenuOption {
  EVENT_REPORTING = '1',
  PATH_SELECTION = '2',
  VOUCHER_SELECTION = '3',
  POST_EVENT_UPDATE = '4',
  EXIT = '9',
}

/**
 * UserInteractionHandler consolidates authentication and menu interaction functionality
 * Handles user authentication and menu selection
 */
export class UserInteractionHandler extends BaseYemotHandler {
  private authenticatedStudent: Student | null = null;
  private studentEvents: DBEvent[] = [];
  private selectedMenuOption: MenuOption | null = null;
  private hasEventsForUpdate = false;
  private hasEventsForPathSelection = false;
  private hasEventsForVoucherSelection = false;

  /**
   * Constructor for the UserInteractionHandler
   * @param call The enhanced Yemot call object with data access capabilities
   */
  constructor(call: Call) {
    super(call);
  }

  /**
   * Handles the complete user interaction flow: authentication, event checking, and menu selection.
   * @returns An object containing the authenticated student and the selected menu option, or null if the flow fails.
   */
  async handleUserInteraction(): Promise<{
    student: Student;
    menuOption: MenuOption;
  } | null> {
    this.logStart('handleUserInteraction');

    try {
      // Step 1: Authenticate the user (student)
      const isAuthenticated = await this.authenticateStudent();
      if (!isAuthenticated || !this.authenticatedStudent) {
        this.call.logWarn('Authentication failed, ending interaction.');
        // authenticateStudent() handles hangup messages on failure
        return null;
      }

      // // Step 2: Check student events (to tailor the menu)
      // // First, we need to fetch the student's events
      // if (this.authenticatedStudent) {
      //   this.studentEvents = await this.call.getStudentEvents(this.authenticatedStudent.id);
      // }
      // await this.checkStudentEvents();

      // // Step 3: Present the main menu and get selection
      // const menuOption = await this.presentMainMenu();
      // if (!menuOption) {
      //   this.call.logWarn('No menu option was selected, ending interaction.');
      //   // presentMainMenu() handles hangup messages on failure (e.g. max attempts)
      //   return null;
      // }

      this.selectedMenuOption = MenuOption.EVENT_REPORTING; // Hardcoded for now
      this.logComplete('handleUserInteraction', {
        studentId: this.authenticatedStudent.id,
        menuSelection: this.selectedMenuOption,
      });

      return {
        student: this.authenticatedStudent,
        menuOption: this.selectedMenuOption,
      };
    } catch (error) {
      this.logError('handleUserInteraction', error as Error);
      await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.ERROR);
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
          const tz = await this.call.readDigits(MESSAGE_CONSTANTS.AUTHENTICATION.ID_PROMPT, {
            max_digits: SYSTEM_CONSTANTS.MAX_ID_DIGITS,
            min_digits: 5, // Minimum reasonable ID length
          });

          // Use the enhanced ExtendedCall method to find student by both userId and TZ
          const student = await this.call.findStudentByTzAndUserId(tz);

          if (student) {
            // Store the student
            this.authenticatedStudent = student;
            // Initialize with empty array - events will be fetched later when needed
            this.studentEvents = [];
          }

          if (!student) {
            this.call.logWarn(`Student with TZ ${tz} not found for user ${this.call.userId}`);
            throw new Error('Student not found with the given TZ');
          }

          return student;
        },
        MESSAGE_CONSTANTS.AUTHENTICATION.STUDENT_NOT_FOUND,
        MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED,
      );
      if (!student) {
        this.call.logWarn('Failed to authenticate student');
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.ERROR);
        return false;
      }

      // Student authenticated successfully
      this.authenticatedStudent = student;
      this.call.logInfo(`Student authenticated: ${student.id}, ${student.name}`);

      // Greet the student by name
      await this.call.playMessage(MESSAGE_CONSTANTS.GENERAL.WELCOME(student.name));

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
      this.call.logWarn('Cannot check student events, student not authenticated.');
      this.logComplete('checkStudentEvents', {
        hasEventsForUpdate: this.hasEventsForUpdate,
        hasEventsForPathSelection: this.hasEventsForPathSelection,
        hasEventsForVoucherSelection: this.hasEventsForVoucherSelection,
      });
      return;
    }

    // We've already fetched events in handleUserInteraction
    const events = this.studentEvents;

    if (events.length === 0) {
      this.call.logInfo(`No events found for student ${this.authenticatedStudent.id} to check for menu options.`);
      this.logComplete('checkStudentEvents', {
        eventsChecked: 0,
        hasEventsForUpdate: false,
        hasEventsForPathSelection: false,
        hasEventsForVoucherSelection: false,
      });
      return;
    }

    this.call.logInfo(
      `Found ${events.length} events for student ${this.authenticatedStudent.id} to check for menu options.`,
    );

    for (const event of events) {
      // Check for Post-Event Update eligibility
      if (event.completedPathReferenceId === null && event.eventDate < new Date()) {
        // Event is not yet marked as completed with a path and the event date is in the past
        this.hasEventsForUpdate = true;
      }

      // Check eligibility using shared utility functions
      if (EventEligibilityUtil.isEligibleForPathSelection(event)) {
        this.hasEventsForPathSelection = true;
      }

      if (EventEligibilityUtil.isEligibleForVoucherSelection(event)) {
        this.hasEventsForVoucherSelection = true;
      }

      if (EventEligibilityUtil.isEligibleForPostEventUpdate(event)) {
        this.hasEventsForUpdate = true;
      }
    }

    this.call.logInfo(
      `Student ${this.authenticatedStudent.id} eligibility: Update=${this.hasEventsForUpdate}, Path=${this.hasEventsForPathSelection}, Voucher=${this.hasEventsForVoucherSelection}`,
    );

    this.logComplete('checkStudentEvents', {
      hasEventsForUpdate: this.hasEventsForUpdate,
      hasEventsForPathSelection: this.hasEventsForPathSelection,
      hasEventsForVoucherSelection: this.hasEventsForVoucherSelection,
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
      this.call.logWarn(`Invalid ID format: ${id} - contains non-digit characters`);
      return false;
    }

    // ID should be reasonably sized
    if (id.length < 5 || id.length > SYSTEM_CONSTANTS.MAX_ID_DIGITS) {
      this.call.logWarn(`Invalid ID length: ${id.length}`);
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
            // MenuOption.EXIT // Exit is usually handled by hangup or a generic "press 9 to exit"
          ];

          menuPrompt += ` ${MESSAGE_CONSTANTS.MENU.MENU_OPTIONS.EVENT_REPORTING(MenuOption.EVENT_REPORTING)}`;

          if (this.hasEventsForPathSelection) {
            menuPrompt += ` ${MESSAGE_CONSTANTS.MENU.MENU_OPTIONS.PATH_SELECTION(MenuOption.PATH_SELECTION)}`;
            allowedOptions.push(MenuOption.PATH_SELECTION);
          }

          if (this.hasEventsForVoucherSelection) {
            menuPrompt += ` ${MESSAGE_CONSTANTS.MENU.MENU_OPTIONS.VOUCHER_SELECTION(MenuOption.VOUCHER_SELECTION)}`;
            allowedOptions.push(MenuOption.VOUCHER_SELECTION);
          }

          if (this.hasEventsForUpdate) {
            menuPrompt += ` ${MESSAGE_CONSTANTS.MENU.MENU_OPTIONS.POST_EVENT_UPDATE(MenuOption.POST_EVENT_UPDATE)}`;
            allowedOptions.push(MenuOption.POST_EVENT_UPDATE);
          }
          // menuPrompt += ` ${MESSAGE_CONSTANTS.MENU.MENU_OPTIONS.EXIT(MenuOption.EXIT)}`; // Consider if EXIT should always be an option here

          const menuResponse = await this.call.readDigits(menuPrompt, {
            max_digits: 1,
            min_digits: 1,
            digits_allowed: allowedOptions,
          });

          // Validate menu selection
          if (!allowedOptions.includes(menuResponse as MenuOption)) {
            this.call.logWarn(`Invalid menu selection: ${menuResponse}`);
            await this.call.playMessage(MESSAGE_CONSTANTS.GENERAL.INVALID_INPUT);
            throw new Error('Invalid menu selection');
          }

          return menuResponse as MenuOption;
        },
        MESSAGE_CONSTANTS.GENERAL.INVALID_INPUT,
        MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED,
      );

      if (!selection) {
        this.call.logWarn('Failed to get a valid menu selection');
        await this.call.hangupWithMessage(MESSAGE_CONSTANTS.GENERAL.MAX_ATTEMPTS_REACHED);
        throw new Error('No menu option selected');
      }

      this.selectedMenuOption = selection;
      this.call.logInfo(`Menu option selected: ${this.selectedMenuOption}`);

      // Confirm menu selection to the user
      let confirmationMessage = '';
      switch (this.selectedMenuOption) {
        case MenuOption.EVENT_REPORTING:
          confirmationMessage = MESSAGE_CONSTANTS.MENU.MENU_CONFIRMATIONS.EVENT_REPORTING;
          break;
        case MenuOption.PATH_SELECTION:
          confirmationMessage = MESSAGE_CONSTANTS.MENU.MENU_CONFIRMATIONS.PATH_SELECTION;
          break;
        case MenuOption.VOUCHER_SELECTION:
          confirmationMessage = MESSAGE_CONSTANTS.MENU.MENU_CONFIRMATIONS.VOUCHER_SELECTION;
          break;
        case MenuOption.POST_EVENT_UPDATE:
          confirmationMessage = MESSAGE_CONSTANTS.MENU.MENU_CONFIRMATIONS.POST_EVENT_UPDATE;
          break;
        case MenuOption.EXIT:
          confirmationMessage = MESSAGE_CONSTANTS.MENU.MENU_CONFIRMATIONS.EXIT;
          break;
      }

      await this.call.playMessage(confirmationMessage);

      this.logComplete('presentMainMenu', {
        selection: this.selectedMenuOption,
      });
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
