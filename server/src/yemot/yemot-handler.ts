import { Logger } from "@nestjs/common";
import { YemotCallHandler, YemotCallProcessor, id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { getDataSource } from "@shared/utils/entity/foreignKey.util";
import { Student } from "src/db/entities/Student.entity";
import { EventType } from "src/db/entities/EventType.entity";
import { StudentHandler } from "./student-handler";
import { EventTypeHandler } from "./event-type-handler";
import { EventDateHandler } from "./event-date-handler";
import { EventExistenceHandler } from "./event-existence-handler";
import { CourseTrackHandler } from "./course-track-handler";
import { GiftHandler } from "./gift-handler";
import { EventSaver } from "./event-saver";
import { Event } from "src/db/entities/Event.entity";
import { Teacher } from "src/db/entities/Teacher.entity";
import { User } from "src/db/entities/User.entity";
import { CoursePath } from "src/db/entities/CoursePath.entity";
import { EventNote } from "src/db/entities/EventNote.entity";
import { EventGift } from "src/db/entities/EventGift.entity";
import { Gift } from "src/db/entities/Gift.entity";
import { Class } from "src/db/entities/Class.entity";

/**
 * Class to handle Yemot calls
 */
export class YemotCallHandlerClass {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  private studentHandler: StudentHandler;
  private eventTypeHandler: EventTypeHandler;
  private eventDateHandler: EventDateHandler;
  private eventExistenceHandler: EventExistenceHandler;
  private courseTrackHandler: CourseTrackHandler;
  private giftHandler: GiftHandler;
  private eventSaver: EventSaver;

  /**
   * Constructor for the YemotCallHandlerClass
   * @param logger Logger instance for logging call-related information
   * @param call The Yemot call object
   */
  constructor(logger: Logger, call: Call) {
    this.logger = logger;
    this.call = call;
    this.logger.log(`Handling call from ${this.call.phone}`);
  }

  /**
   * Initializes the data source connection
   */
  async initializeDataSource(): Promise<void> {
    this.dataSource = await getDataSource([Student, EventType, Event, Teacher, User, CoursePath, EventNote, EventGift, Gift, Class]);
    this.logger.log('Data source initialized successfully');
    // Initialize handlers with the data source
    this.studentHandler = new StudentHandler(this.logger, this.call, this.dataSource);
    this.eventTypeHandler = new EventTypeHandler(this.logger, this.call, this.dataSource);
    this.eventDateHandler = new EventDateHandler(this.logger, this.call);
    this.eventExistenceHandler = new EventExistenceHandler(this.logger, this.call, this.dataSource);
    this.courseTrackHandler = new CourseTrackHandler(this.logger, this.call, this.dataSource);
    this.giftHandler = new GiftHandler(this.logger, this.call, this.dataSource);
    this.eventSaver = new EventSaver(this.logger, this.dataSource);
  }

  /**
   * Completes the call with a success message and hangs up
   */
  finishCall() {
    id_list_message_with_hangup(this.call, 'תודה על הדיווח. האירוע נשמר בהצלחה במערכת');
  }

  /**
   * Executes the full call handling flow
   */
  async execute() {
    await this.initializeDataSource();

    // Step 1: Handle student identification
    await this.studentHandler.handleStudentIdentification();
    const student = this.studentHandler.getStudent();

    // Step 2: Handle event type selection
    await this.eventTypeHandler.handleEventTypeSelection();
    const eventType = this.eventTypeHandler.getSelectedEventType();

    // Step 3: Handle event date selection
    await this.eventDateHandler.handleEventDateSelection();
    const dateInfo = this.eventDateHandler.getSelectedDate();

    // Step 4: Check if event exists with same student, type, and date
    await this.eventExistenceHandler.checkEventExists(student, eventType, dateInfo.gregorianDate);
    const existingEvent = this.eventExistenceHandler.getExistingEvent();
    const isNewEvent = this.eventExistenceHandler.getIsNewEvent();

    // Step 5: Course track selection
    // Use the newly created method that handles existing course paths
    await this.courseTrackHandler.handleCourseTrackSelectionWithExisting(existingEvent?.coursePath || null);
    const coursePath = this.courseTrackHandler.getSelectedCourseTrack();

    // Step 6: Gift selection (up to 3)
    // Use the newly created method that handles existing gifts
    await this.giftHandler.handleGiftSelectionWithExisting(existingEvent?.eventGifts);
    const selectedGifts = this.giftHandler.getSelectedGifts();

    // Step 7: Save the event
    const savedEvent = await this.eventSaver.saveEvent(
      existingEvent,
      student,
      eventType,
      dateInfo.gregorianDate,
      coursePath,
      selectedGifts
    );
    
    this.logger.log(`Event ${isNewEvent ? 'created' : 'updated'} successfully with ID: ${savedEvent.id}`);
    
    // Finish the call
    this.finishCall();
  }
}

export const yemotHandler: YemotCallHandler = (logger) => async (call) => {
  const handler = new YemotCallHandlerClass(logger, call);
  return handler.execute();
};

export const yemotProcessor: YemotCallProcessor = async (call, logger) => {
  logger.log(`Processing call ${call.callId} from ${call.phone}`);
  // Here you can add any additional processing logic you need
  // For example, saving the call data to a database or sending a notification
  // await saveCallDataToDatabase(call);
  // await sendNotification(call);
};
