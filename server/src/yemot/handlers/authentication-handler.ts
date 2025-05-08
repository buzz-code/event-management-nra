import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { BaseYemotHandler } from "../core/base-yemot-handler";
import { Student } from "src/db/entities/Student.entity";

/**
 * Handler responsible for authenticating users by their ID number
 * Currently supports student authentication but could be extended for teachers or staff
 */
export class AuthenticationHandler extends BaseYemotHandler {
  private student: Student | null = null;

  /**
   * Constructor for the AuthenticationHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   */
  constructor(logger: Logger, call: Call, dataSource: DataSource) {
    super(logger, call, dataSource);
  }

  /**
   * Authenticates a student by their ID number (tz)
   * @returns The authenticated student object
   * @throws Error if authentication fails after max retries
   */
  async authenticateStudent(): Promise<Student> {
    this.logStart('authenticateStudent');
    
    try {
      await this.withRetry(
        async () => {
          const studentTz = await this.collectStudentTz(false);
          return await this.findAndVerifyStudent(studentTz);
        },
        'מספר נסיונות הזיהוי הגיע למקסימום',
        'מספר ת.ז שהוקש אינו קיים במערכת. נסי שנית'
      );
      
      if (!this.student) {
        throw new Error('Student authentication failed');
      }

      // If successful, greet the student
      await this.playMessage(`שלום ${this.student.firstName} ${this.student.lastName}`);
      
      this.logComplete('authenticateStudent', { 
        studentId: this.student.id, 
        name: `${this.student.firstName} ${this.student.lastName}` 
      });
      
      return this.student;
    } catch (error) {
      this.logger.error(`Authentication failed: ${error.message}`);
      await this.hangupWithMessage('לא ניתן לזהות את מספר תעודת הזהות. אנא פני למזכירות.');
      throw error; // Rethrow to handle in caller
    }
  }

  /**
   * Collects the student's ID number (tz)
   * @param isRetry Whether this is a retry attempt
   * @returns The student's ID number
   */
  private async collectStudentTz(isRetry: boolean = false): Promise<string> {
    this.logStart('collectStudentTz');
    
    // Use different message for retry attempts
    const message = isRetry 
      ? 'מספר ת.ז שגוי נא הקישי שוב' 
      : 'אנא הקישי את מספר תעודת הזהות שלך';
    
    const studentTz = await this.readDigits(message, {
      max_digits: 9,
      min_digits: 9,
    });
    
    this.logger.log(`User entered ID number: ${studentTz}`);
    this.logComplete('collectStudentTz');
    return studentTz;
  }

  /**
   * Finds a student by their ID number and verifies they exist
   * @param tz The student's ID number
   * @returns true if student was found, throws error otherwise
   */
  private async findAndVerifyStudent(tz: string): Promise<boolean> {
    this.logStart('findAndVerifyStudent');
    
    this.student = await this.dataSource.getRepository(Student).findOne({
      where: { tz }
    });

    if (this.student) {
      this.logger.log(`Found student: ${this.student.firstName} ${this.student.lastName}`);
      this.logComplete('findAndVerifyStudent', { found: true });
      return true;
    } else {
      this.logger.log(`No student found with ID number: ${tz}`);
      this.logComplete('findAndVerifyStudent', { found: false });
      throw new Error(`Student with ID ${tz} not found`);
    }
  }

  /**
   * Gets the authenticated student
   * @returns The student object
   */
  getStudent(): Student | null {
    return this.student;
  }
}