import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";

// Import CoursePath entity from the correct path
import { CoursePath } from "src/db/entities/CoursePath.entity";

/**
 * Class to handle course track selection operations
 */
export class CourseTrackHandler {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  private courseTracks: CoursePath[] = [];
  private selectedCourseTrack: CoursePath | null = null;

  /**
   * Constructor for the CourseTrackHandler
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
   * Fetches all course tracks from the database
   */
  private async fetchCourseTracks(): Promise<void> {
    this.courseTracks = await this.dataSource.getRepository(CoursePath).find({
      order: {
        key: 'ASC'
      }
    });

    if (this.courseTracks.length === 0) {
      this.logger.warn('No course tracks found in the database');
    } else {
      this.logger.log(`Found ${this.courseTracks.length} course tracks`);
    }
  }

  /**
   * Creates a message prompting the user to select from available course tracks
   */
  private createCourseTrackSelectionPrompt(): string {
    let prompt = 'אנא בחר את מסלול הלימוד על ידי הקשת המספר המתאים:\n';

    this.courseTracks.forEach(track => {
      prompt += `להקשת ${track.key} עבור ${track.name}`;
      if (track.description) {
        prompt += ` - ${track.description}`;
      }
      prompt += '\n';
    });

    return prompt;
  }

  /**
   * Asks the user to select a course track and validates the selection
   * @returns The selected course track key
   */
  private async promptForCourseTrackSelection(): Promise<number> {
    const maxDigits = Math.max(...this.courseTracks.map(track => track.key.toString().length));
    const allowedKeys = this.courseTracks.map(track => track.key.toString());

    const prompt = this.createCourseTrackSelectionPrompt();

    const selection = await this.call.read([{ type: 'text', data: prompt }], 'tap', {
      max_digits: maxDigits,
      digits_allowed: allowedKeys
    });

    return parseInt(selection);
  }

  /**
   * Handles the course track selection process with an existing track
   * @param existingCoursePath The existing course path that may be reused
   */
  async handleCourseTrackSelectionWithExisting(existingCoursePath: CoursePath | null): Promise<void> {
    // If there's an existing course path, ask if the user wants to change it
    if (existingCoursePath) {
      this.logger.log(`Found existing course path: ${existingCoursePath.name}`);
      id_list_message(this.call, `מסלול הלימוד הנוכחי הוא: ${existingCoursePath.name}`);
      
      // Ask if they want to change it
      const changeCourseTrack = await this.call.read([
        { type: 'text', data: 'האם ברצונך לשנות את מסלול הלימוד? הקישי 1 לאישור או 2 להשארת המסלול הנוכחי.' }
      ], 'tap', {
        max_digits: 1,
        digits_allowed: ['1', '2']
      });
      
      if (changeCourseTrack === '2') {
        // User chose to keep the existing course path
        this.selectedCourseTrack = existingCoursePath;
        this.logger.log(`User kept existing course path: ${existingCoursePath.name}`);
        return;
      }
      // If we get here, user wants to select a new course path
    }

    // If no existing course path or user chose to change it, handle normal selection
    await this.handleCourseTrackSelection();
  }

  /**
   * Handles the complete course track selection process
   * Will repeat the question if an invalid selection is made
   */
  async handleCourseTrackSelection(): Promise<void> {
    // First fetch the course tracks
    await this.fetchCourseTracks();

    if (this.courseTracks.length === 0) {
      return id_list_message_with_hangup(this.call, 'אין מסלולי לימוד במערכת כרגע. אנא פני למנהל המערכת.');
    }

    let validSelection = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!validSelection && attempts < maxAttempts) {
      const selectedKey = await this.promptForCourseTrackSelection();

      // Find the selected course track
      this.selectedCourseTrack = this.courseTracks.find(track => track.key === selectedKey) || null;

      if (this.selectedCourseTrack) {
        this.logger.log(`User selected course track: ${this.selectedCourseTrack.name} (${this.selectedCourseTrack.key})`);
        id_list_message(this.call, `בחרת במסלול: ${this.selectedCourseTrack.name}`);
        validSelection = true;
      } else {
        // This shouldn't happen due to digits_allowed, but just in case
        this.logger.warn(`Invalid course track selection: ${selectedKey}`);
        id_list_message(this.call, 'בחירה לא תקינה, אנא נסי שנית');
        attempts++;
      }
    }

    if (!validSelection) {
      this.logger.error('Maximum course track selection attempts reached');
      return id_list_message_with_hangup(this.call, 'מספר נסיונות הבחירה הגיע למקסימום. אנא נסי להתקשר שנית מאוחר יותר.');
    }
  }

  /**
   * Gets the selected course track
   * @returns The selected course track object
   */
  getSelectedCourseTrack(): CoursePath | null {
    return this.selectedCourseTrack;
  }
}