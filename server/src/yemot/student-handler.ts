import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";

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
  private maxRetries: number = 3; // Maximum number of retries for ID input

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
   * If student is not found, allows retry up to maxRetries
   */
  async handleStudentIdentification(): Promise<void> {
    let attempts = 0;
    let studentFound = false;

    while (attempts < this.maxRetries && !studentFound) {
      const studentTz = await this.collectStudentTz(attempts > 0);
      studentFound = await this.findStudentByTz(studentTz);
      
      if (!studentFound) {
        attempts++;
        
        // If we've reached the maximum number of retries, end the call
        if (attempts >= this.maxRetries) {
          this.logger.log(`Maximum retries (${this.maxRetries}) reached for student identification`);
          id_list_message_with_hangup(this.call, 'לא נמצא תלמיד עם מספר תעודת זהות זה במערכת לאחר מספר ניסיונות. אנא פנה למזכירות.');
          return;
        }
      }
    }
    
    // If we reach here and student is found, greet the student
    if (this.student) {
      await id_list_message(this.call, `שלום ${this.student.firstName} ${this.student.lastName}`);
    }
  }

  /**
   * Collects the student's ID number (tz)
   * @param isRetry Whether this is a retry attempt
   * @returns The student's ID number
   * @private Internal method used by handleStudentIdentification
   */
  private async collectStudentTz(isRetry: boolean = false): Promise<string> {
    // Use different message for retry attempts
    const message = isRetry 
      ? 'מספר ת.ז שגוי נא הקישי שוב' 
      : 'אנא הקישי את מספר תעודת הזהות שלך';
    
    const studentTz = await this.call.read([{ type: 'text', data: message }], 'tap', {
      max_digits: 9,
      min_digits: 9,
    });
    this.logger.log(`User entered ID number: ${studentTz}`);
    return studentTz;
  }

  /**
   * Finds a student by their ID number
   * @param tz The student's ID number
   * @returns boolean indicating if student was found
   * @private Internal method used by handleStudentIdentification
   */
  private async findStudentByTz(tz: string): Promise<boolean> {
    this.student = await this.dataSource.getRepository(Student).findOne({
      where: { tz }
    });

    if (this.student) {
      this.logger.log(`Found student: ${this.student.firstName} ${this.student.lastName}`);
      return true;
    } else {
      this.logger.log(`No student found with ID number: ${tz}`);
      return false;
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