import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { id_list_message } from "@shared/utils/yemot/yemot-router";
import { Student } from "src/db/entities/Student.entity";
import { Event } from "src/db/entities/Event.entity";

/**
 * Class to handle the main menu operations
 */
export class MainMenuHandler {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  private student: Student | null = null;
  private selectedOption: number | null = null;
  private hasExistingEvents: boolean = false;
  private hasPastEvents: boolean = false;

  /**
   * Constructor for the MainMenuHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, call: Call, dataSource: DataSource) {
    this.logger = logger;
    this.call = call;
    this.dataSource = dataSource;
  }

  /**
   * Sets the current student
   * @param student The student object
   */
  setStudent(student: Student): void {
    this.student = student;
  }

  /**
   * Checks if the student has any existing events
   * @returns Promise<boolean> True if student has events, false otherwise
   */
  async checkForExistingEvents(): Promise<boolean> {
    if (!this.student) {
      this.logger.warn('Attempting to check for events without a student set');
      return false;
    }

    // Use TypeORM to find events for this student with studentReferenceId
    const events = await this.dataSource.getRepository(Event).find({
      where: { studentReferenceId: this.student.id }
    });

    this.hasExistingEvents = events.length > 0;
    
    // Check for past events (events with dates before today) using eventDate
    const today = new Date();
    const pastEvents = events.filter(event => new Date(event.eventDate) < today);
    this.hasPastEvents = pastEvents.length > 0;
    
    this.logger.log(`Student ${this.student.id} has ${events.length} existing events and ${pastEvents.length} past events`);
    
    return this.hasExistingEvents;
  }

  /**
   * Presents the main menu to the user and collects their choice
   * Different options are available based on whether the student has existing events
   * @returns Promise<number> The selected menu option
   */
  async presentMainMenu(): Promise<number> {
    let menuText = 'לדווח שמחה הקישי 1';
    let allowedDigits = ['1'];
    
    // Options 2 and 3 are available if the student has any events
    if (this.hasExistingEvents) {
      menuText += ' לבחירת מסלול הקישי 2';
      menuText += ' לבחירת שוברים הקישי 3';
      allowedDigits.push('2', '3');
    }
    
    // Option 4 is only available if the student has past events
    if (this.hasPastEvents) {
      menuText += ' לעידכון לאחר השמחה הקישי 4';
      allowedDigits.push('4');
    }
    
    if (!this.hasExistingEvents) {
      menuText += ' הערה- מסלולים 2,3,4 ניתנים רק לת.ז שמעודכן עליה יש לה שמחה.';
    }
    
    // Using the correct parameters for the yemot-router2 library with digits_allowed
    const response = await this.call.read(
      [{ type: 'text', data: menuText }],
      'tap',
      {
        max_digits: 1,
        min_digits: 1,
        digits_allowed: allowedDigits
      }
    ) as string;

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
      await id_list_message(this.call, confirmationMessage);
    }

    return this.selectedOption;
  }

  /**
   * Gets the selected main menu option
   * @returns The selected menu option
   */
  getSelectedOption(): number | null {
    return this.selectedOption;
  }
}