import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";

// Import Student entity from the correct path
import { Student } from "src/db/entities/Student.entity";

/**
 * Class to handle student-related operations
 */
export class StudentHandler {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  private student: Student | null = null;

  /**
   * Constructor for the StudentHandler
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
   * Handles the entire student identification process
   * Collects student TZ, validates it, and finds the student
   * If student is not found, the call will be terminated
   */
  async handleStudentIdentification(): Promise<void> {
    const studentTz = await this.collectStudentTz();
    await this.findStudentByTz(studentTz);
    // If we reach here, the student was found successfully
  }

  /**
   * Collects the student's ID number (tz)
   * @returns The student's ID number
   * @private Internal method used by handleStudentIdentification
   */
  private async collectStudentTz(): Promise<string> {
    const studentTz = await this.call.read([{ type: 'text', data: 'אנא הקש את מספר תעודת הזהות שלך' }], 'tap', {
      max_digits: 9,
      min_digits: 9,
    });
    this.logger.log(`User entered ID number: ${studentTz}`);
    return studentTz;
  }

  /**
   * Finds a student by their ID number
   * Handles the not found case internally by terminating the call
   * @param tz The student's ID number
   * @private Internal method used by handleStudentIdentification
   */
  private async findStudentByTz(tz: string): Promise<void> {
    try {
      this.student = await this.dataSource.getRepository(Student).findOne({ 
        where: { tz }
      });
      
      if (this.student) {
        this.logger.log(`Found student: ${this.student.first_name} ${this.student.last_name}`);
      } else {
        this.logger.log(`No student found with ID number: ${tz}`);
        // Handle not found scenario internally
        // This will automatically terminate the function
        id_list_message_with_hangup(this.call, 'לא נמצא תלמיד עם מספר תעודת זהות זה במערכת. אנא פנה למזכירות.');
      }
    } catch (error) {
      this.logger.error(`Error searching for student: ${error.message}`);
      id_list_message_with_hangup(this.call, 'אירעה שגיאה בחיפוש התלמיד. אנא פנה למזכירות.');
    }
  }

  /**
   * Gets the current student
   * @returns The student object
   */
  getStudent(): Student | null {
    return this.student;
  }
}