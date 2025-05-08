import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { BaseYemotHandler } from "../core/base-yemot-handler";
import { Student } from "src/db/entities/Student.entity";
import { Event } from "src/db/entities/Event.entity";
import { LevelType } from "src/db/entities/LevelType.entity";
import { EventForUpdateSelectionHandler } from "./selection/event-for-update-selection-handler";
import { PathSelectionHandler } from "./selection/path-handler";

/**
 * Handler for updating post-event completion status
 * This allows students to report which path they have completed after their celebration
 */
export class PostEventHandler extends BaseYemotHandler {
  private student: Student | null = null;
  private selectedEvent: Event | null = null;
  private completedPathId: number | null = null; // This stores the ID of the selected path

  /**
   * Constructor for the PostEventHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source
   * @param eventSelector Handler for selecting events to update
   * @param pathSelector Handler for selecting the completed path
   */
  constructor(
    logger: Logger, 
    call: Call, 
    dataSource: DataSource, 
    private eventSelector: EventForUpdateSelectionHandler, 
    private pathSelector: PathSelectionHandler
  ) {
    super(logger, call, dataSource);
  }

  /**
   * Sets the student for this handler
   * @param student The identified student
   */
  setStudent(student: Student): void {
    this.student = student;
    this.eventSelector.setStudent(student);
  }

  /**
   * Main method for handling the post-event update flow
   * @returns True if the flow was completed successfully
   */
  async handlePostEventUpdate(): Promise<boolean> {
    this.logStart('handlePostEventUpdate');

    try {
      if (!this.student) {
        throw new Error('Student not set');
      }

      // Use EventForUpdateSelectionHandler to select the event
      await this.eventSelector.handleSelection(); // This handles fetching, prompting, no items message, retries etc.
      const selectedEventItem = this.eventSelector.getSelectedItem();

      if (!selectedEventItem) {
        this.logger.log('No event selected for update by user or selection failed.');
        // EventForUpdateSelectionHandler (via BaseSelectionHandler) would have played appropriate messages
        // (e.g., "אין אפשרויות..." or "מספר נסיונות הבחירה הגיע למקסימום...") and hung up if necessary.
        // If getSelectedItem() is null, the selection process within EventForUpdateSelectionHandler was not successful.
        // No further messages should be played here by PostEventHandler in this specific failure case,
        // as the sub-handler (EventForUpdateSelectionHandler) is responsible for final user communication on its failure.
        this.logger.log('Event selection failed or was aborted within EventForUpdateSelectionHandler.');
        return false; // Indicate failure to the orchestrator
      }
      this.selectedEvent = selectedEventItem.originalEvent;
      this.logger.log(`Proceeding with selected event: ${this.selectedEvent.name} (ID: ${this.selectedEvent.id})`);

      // Let user select which path they completed
      await this.selectCompletedPath();

      if (this.completedPathId !== null) {
        // Update the event with the completed path information
        await this.updateEventCompletionStatus();

        await this.playMessage('תודה רבה! המידע על המסלול שהושלם נשמר בהצלחה.');
        return true;
      } else {
        await this.playMessage('לא נבחר מסלול שהושלם.');
        return false;
      }

    } catch (error) {
      this.logger.error(`Post-event update failed: ${error.message}`);
      await this.playMessage('אירעה שגיאה בעדכון הפרטים. אנא נסי שנית מאוחר יותר.');
      return false;
    }
  }

  /**
   * Lets the user select which path they completed
   */
  private async selectCompletedPath(): Promise<void> {
    this.logStart('selectCompletedPath');

    await this.pathSelector.handleSelection(); // This method handles fetching, prompting, and retries.
    const selectedPath = this.pathSelector.getSelectedPath();

    if (selectedPath) {
      this.completedPathId = selectedPath.id; // Store the ID of the selected path
      this.logger.log(`User selected path: ${selectedPath.name} (ID: ${this.completedPathId}, Key: ${selectedPath.key})`);
      // The PathSelectionHandler already plays a confirmation message like "בחרת במסלול: [שם המסלול]"
      // as per its announceSelectionResult method.
    } else {
      this.logger.log('No path selected by the user or selection process failed.');
      // PathSelectionHandler handles messages for no items or max retries and hangs up if needed.
      // If getSelectedPath() is null, it means the selection wasn't successful.
      // The main flow in handlePostEventUpdate will check this.completedPathId and react accordingly.
    }

    this.logComplete('selectCompletedPath');
  }

  /**
   * Updates the event with the completed path information
   */
  private async updateEventCompletionStatus(): Promise<void> {
    this.logStart('updateEventCompletionStatus');

    if (!this.selectedEvent || this.completedPathId === null) {
      throw new Error('Event or completed path ID not set for update.');
    }

    const eventToUpdate = await this.dataSource.getRepository(Event).findOneBy({ id: this.selectedEvent.id });
    if (!eventToUpdate) {
      throw new Error(`Event with ID ${this.selectedEvent.id} not found for update.`);
    }

    // Find the path entity (LevelType) for completedPathId
    const completedPath = await this.dataSource.getRepository(LevelType).findOneBy({ id: this.completedPathId });
    if (!completedPath) {
      throw new Error(`Path with ID ${this.completedPathId} not found.`);
    }

    eventToUpdate.completedPathKey = completedPath.key; // Set the key of the selected path
    eventToUpdate.completedPathReferenceId = this.completedPathId; // Set the ID of the selected path
    eventToUpdate.completionReportDate = new Date();

    await this.dataSource.getRepository(Event).save(eventToUpdate);

    this.logger.log(`Updated event ID ${this.selectedEvent.id} with completed path ID ${this.completedPathId} (Key: ${completedPath.key})`);
    this.logComplete('updateEventCompletionStatus');
  }
}