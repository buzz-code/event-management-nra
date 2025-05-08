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
import { LevelTypeHandler } from "./level-type-handler";
import { GiftHandler } from "./gift-handler";
import { EventSaver } from "./event-saver";
import { MainMenuHandler } from "./main-menu-handler"; // Import the new MainMenuHandler
import { Event } from "src/db/entities/Event.entity";
import { Teacher } from "src/db/entities/Teacher.entity";
import { User } from "src/db/entities/User.entity";
import { LevelType } from "src/db/entities/LevelType.entity";
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
  private levelTypeHandler: LevelTypeHandler;
  private giftHandler: GiftHandler;
  private eventSaver: EventSaver;
  private mainMenuHandler: MainMenuHandler; // New handler for main menu

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
    this.dataSource = await getDataSource([Student, EventType, Event, Teacher, User, LevelType, EventNote, EventGift, Gift, Class]);
    this.logger.log('Data source initialized successfully');
    
    // Initialize handlers with the data source
    this.studentHandler = new StudentHandler(this.logger, this.call, this.dataSource);
    this.eventTypeHandler = new EventTypeHandler(this.logger, this.call, this.dataSource);
    this.eventDateHandler = new EventDateHandler(this.logger, this.call);
    this.eventExistenceHandler = new EventExistenceHandler(this.logger, this.call, this.dataSource);
    this.levelTypeHandler = new LevelTypeHandler(this.logger, this.call, this.dataSource);
    this.giftHandler = new GiftHandler(this.logger, this.call, this.dataSource);
    this.eventSaver = new EventSaver(this.logger, this.dataSource);
    this.mainMenuHandler = new MainMenuHandler(this.logger, this.call, this.dataSource); // Initialize the main menu handler
  }

  /**
   * Completes the call with a success message and hangs up
   */
  finishCall(message: string = 'תודה על הדיווח. האירוע נשמר בהצלחה במערכת') {
    id_list_message_with_hangup(this.call, message);
  }

  /**
   * Handles the report celebration flow
   * This is the original flow that has been refactored
   */
  async handleReportCelebration() {
    // Step 1: Handle event type selection
    await this.eventTypeHandler.handleEventTypeSelection();
    const eventType = this.eventTypeHandler.getSelectedEventType();

    // Step 2: Handle event date selection
    await this.eventDateHandler.handleEventDateSelection();
    const dateInfo = this.eventDateHandler.getSelectedDate();

    // Step 3: Check if event exists with same student, type, and date
    const student = this.studentHandler.getStudent();
    if (!student) {
      this.logger.error('Student is null in handleReportCelebration');
      this.finishCall('אירעה שגיאה, אנא נסי שוב מאוחר יותר');
      return;
    }
    
    await this.eventExistenceHandler.checkEventExists(student, eventType, dateInfo.gregorianDate);
    const existingEvent = this.eventExistenceHandler.getExistingEvent();
    const isNewEvent = this.eventExistenceHandler.getIsNewEvent();
    
    // If event exists, inform user they need to call for modifications
    if (!isNewEvent) {
      await id_list_message_with_hangup(
        this.call, 
        `נמצא אירוע קיים מסוג ${eventType.name} בתאריך ${dateInfo.hebrewDate}. אין אפשרות לשנות אירוע קיים. כדי לשנות אירוע קיים יש ליצור קשר טלפוני בשעות הערב במספר 0533152632`
      );
      return;
    }

    // Step 4: Report success for new event
    await id_list_message(this.call, `יצירת אירוע חדש מסוג ${eventType.name} בתאריך ${dateInfo.hebrewDate}`);
    
    // Finish with success message
    this.finishCall('הפרטים עודכנו בהצלחה, מזל טוב');
  }

  /**
   * Handles the path/track selection flow
   */
  async handlePathSelection() {
    // Check that student has existing events
    const student = this.studentHandler.getStudent();
    if (!student) {
      this.logger.error('Student is null in handlePathSelection');
      this.finishCall('אירעה שגיאה, אנא נסי שוב מאוחר יותר');
      return;
    }

    // Use level type handler for path selection (will be renamed in future task)
    await this.levelTypeHandler.handleLevelTypeSelection();
    const levelType = this.levelTypeHandler.getSelectedLevelType();
    
    // Confirm path selection
    await id_list_message(this.call, `בחרת במסלול: ${levelType.name}`);
    
    // Option to continue to voucher selection or finish
    const response = await this.call.read(
      [{ type: 'text', data: 'לבחירת שוברים הקישי 1, לסיום הקישי 2' }],
      'tap',
      {
        max_digits: 1,
        min_digits: 1,
        digits_allowed: ['1', '2']
      }
    ) as string;
    
    // Convert string response to number
    const continueChoice = parseInt(response);
    
    if (continueChoice === 1) {
      await this.handleVoucherSelection();
    } else {
      this.finishCall('בחירת המסלול נשמרה בהצלחה');
    }
  }

  /**
   * Handles the voucher selection flow
   */
  async handleVoucherSelection() {
    // Use gift handler for voucher selection (will be renamed in future task)
    await this.giftHandler.handleGiftSelection();
    const selectedGifts = this.giftHandler.getSelectedGifts();
    
    // Create a list of selected voucher names
    const giftNames = selectedGifts.map(gift => gift.name).join(', ');
    
    // Confirm voucher selection
    await id_list_message(this.call, `השוברים שבחרת: ${giftNames}`);
    
    // Ask for confirmation
    const response = await this.call.read(
      [{ type: 'text', data: 'לאישור הקישי 1, לשינוי הקישי 2' }],
      'tap',
      {
        max_digits: 1,
        min_digits: 1,
        digits_allowed: ['1', '2']
      }
    ) as string;
    
    // Convert string response to number
    const confirmChoice = parseInt(response);
    
    if (confirmChoice === 1) {
      // User confirmed selection
      this.finishCall('בחירת השובר נשמרה בהצלחה במערכת');
    } else {
      // User wants to change selection, run voucher selection again
      await this.handleVoucherSelection();
    }
  }

  /**
   * Handles the post-celebration update flow
   */
  async handlePostCelebrationUpdate() {
    // This will be implemented in Task 5
    this.finishCall('עדכון לאחר שמחה - פונקציונליות זו תיושם בקרוב');
  }

  /**
   * Executes the full call handling flow with the new menu structure
   */
  async execute() {
    await this.initializeDataSource();

    // Step 1: Handle student identification
    await this.studentHandler.handleStudentIdentification();
    const student = this.studentHandler.getStudent();
    
    if (!student) {
      this.logger.error('Student is null after identification');
      return; // The student handler will have already terminated the call
    }

    // Step 2: Check if student has existing events for the main menu options
    this.mainMenuHandler.setStudent(student);
    await this.mainMenuHandler.checkForExistingEvents();
    
    // Step 3: Present main menu and get user choice
    await this.mainMenuHandler.presentMainMenu();
    const menuChoice = this.mainMenuHandler.getSelectedOption();
    
    // Step 4: Handle the selected menu option
    switch (menuChoice) {
      case 1:
        // Report celebration (original flow)
        await this.handleReportCelebration();
        break;
      case 2:
        // Choose path/track
        await this.handlePathSelection();
        break;
      case 3:
        // Choose vouchers
        await this.handleVoucherSelection();
        break;
      case 4:
        // Update after celebration
        await this.handlePostCelebrationUpdate();
        break;
      default:
        this.logger.error(`Invalid menu choice: ${menuChoice}`);
        this.finishCall('אירעה שגיאה, אנא נסי שוב מאוחר יותר');
    }
  }
}

export const yemotHandler: YemotCallHandler = (logger) => async (call) => {
  const handler = new YemotCallHandlerClass(logger, call);
  return handler.execute();
};

export const yemotProcessor: YemotCallProcessor = async (call, logger) => {
  logger.log(`Processing call ${call.callId} from ${call.phone}`);
  // Here you can add any additional processing logic you need
};
