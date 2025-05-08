import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { BaseYemotHandler } from "../core/base-yemot-handler";
import { Student } from "src/db/entities/Student.entity";
import { Event } from "src/db/entities/Event.entity";

/**
 * Handler for menu operations
 * Presents different options based on student status and collects user choice
 */
export class MenuHandler extends BaseYemotHandler {
  private student: Student | null = null;
  private selectedOption: number | null = null;
  private hasExistingEvents: boolean = false;
  private hasPastEvents: boolean = false;

  /**
   * Constructor for the MenuHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, call: Call, dataSource: DataSource) {
    super(logger, call, dataSource);
  }

  /**
   * Sets the current student for menu customization
   * @param student The student object
   */
  setStudent(student: Student): void {
    this.student = student;
  }

  /**
   * Checks if the student has existing or past events
   * Used to determine which menu options to present
   * @returns Whether the student has any events
   */
  async checkStudentEvents(): Promise<boolean> {
    this.logStart('checkStudentEvents');
    
    if (!this.student) {
      this.logger.warn('Attempting to check for events without a student set');
      return false;
    }

    // Find all events for this student
    const events = await this.dataSource.getRepository(Event).find({
      where: { studentReferenceId: this.student.id }
    });

    this.hasExistingEvents = events.length > 0;
    
    // Check for past events (events with dates before today)
    const today = new Date();
    const pastEvents = events.filter(event => new Date(event.eventDate) < today);
    this.hasPastEvents = pastEvents.length > 0;
    
    this.logger.log(
      `Student ${this.student.id} has ${events.length} existing events and ${pastEvents.length} past events`
    );
    
    this.logComplete('checkStudentEvents', {
      hasEvents: this.hasExistingEvents,
      hasPastEvents: this.hasPastEvents
    });
    
    return this.hasExistingEvents;
  }

  /**
   * Presents the main menu to the user and collects their choice
   * Different options are available based on student event status
   * @returns The selected menu option
   */
  async presentMainMenu(): Promise<number> {
    this.logStart('presentMainMenu');
    
    // Build the menu text based on student event status
    const menuOptions: { [key: string]: string } = {
      '1': 'לדווח שמחה הקישי 1'
    };
    
    let allowedDigits = ['1'];
    
    // Options 2 and 3 are available if the student has any events
    if (this.hasExistingEvents) {
      menuOptions['2'] = 'לבחירת מסלול הקישי 2';
      menuOptions['3'] = 'לבחירת שוברים הקישי 3';
      allowedDigits.push('2', '3');
    }
    
    // Option 4 is only available if the student has past events
    if (this.hasPastEvents) {
      menuOptions['4'] = 'לעידכון לאחר השמחה הקישי 4';
      allowedDigits.push('4');
    }
    
    // Build the complete menu text
    let menuText = Object.values(menuOptions).join('\n');
    
    // Add a note for unavailable options
    if (!this.hasExistingEvents) {
      menuText += '\nהערה- מסלולים 2,3,4 ניתנים רק לת.ז שמעודכן עליה יש לה שמחה.';
    }
    
    // Present the menu and get user choice
    const response = await this.readDigits(menuText, {
      max_digits: 1,
      min_digits: 1,
      digits_allowed: allowedDigits
    });

    // Convert response to number
    this.selectedOption = parseInt(response);
    this.logger.log(`User selected main menu option: ${this.selectedOption}`);
    
    // Confirm the selected option to the user
    let confirmationMessage = '';
    switch (this.selectedOption) {
      case 1:
        confirmationMessage = 'בחרת לדווח על שמחה';
        break;
      case 2:
        confirmationMessage = 'בחרת לבחור מסלול';
        break;
      case 3:
        confirmationMessage = 'בחרת לבחור שוברים';
        break;
      case 4:
        confirmationMessage = 'בחרת לעדכן לאחר השמחה';
        break;
    }

    if (confirmationMessage) {
      await this.playMessage(confirmationMessage);
    }
    
    this.logComplete('presentMainMenu', { option: this.selectedOption });
    return this.selectedOption;
  }

  /**
   * Gets the selected menu option
   * @returns The selected option number
   */
  getSelectedOption(): number | null {
    return this.selectedOption;
  }
}