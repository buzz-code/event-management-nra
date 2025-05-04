import { Logger } from "@nestjs/common";
import { YemotCallHandler, YemotCallProcessor, id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { getDataSource } from "@shared/utils/entity/foreignKey.util";
import { Student } from "src/db/entities/Student.entity";
import { EventType } from "src/db/entities/EventType.entity";
import { StudentHandler } from "./student-handler";
import { EventTypeHandler } from "./event-type-handler";

/**
 * Class to handle Yemot calls
 */
export class YemotCallHandlerClass {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  private studentHandler: StudentHandler;
  private eventTypeHandler: EventTypeHandler;

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
    try {
      this.dataSource = await getDataSource([Student, EventType]);
      this.logger.log('Data source initialized successfully');
      // Initialize handlers with the data source
      this.studentHandler = new StudentHandler(this.logger, this.call, this.dataSource);
      this.eventTypeHandler = new EventTypeHandler(this.logger, this.call, this.dataSource);
    } catch (error) {
      this.logger.error(`Failed to initialize data source: ${error.message}`);
      throw error;
    }
  }

  /**
   * Initial greeting step that requests the user to press 10
   */
  async initialGreeting(): Promise<void> {
    await this.call.read([{ type: 'text', data: 'היי, תקיש 10' }], 'tap', {
      max_digits: 2,
      min_digits: 2,
      digits_allowed: ['10']
    });
  }

  /**
   * Collects the user's name
   * @returns The user's name input
   */
  async collectName(): Promise<string> {
    const name = await this.call.read([{ type: 'text', data: 'שלום, אנא הקש את שמך המלא' }], 'tap', {
      typing_playback_mode: 'HebrewKeyboard'
    });
    this.logger.log(`User entered name: ${name}`);
    return name;
  }

  /**
   * Greets the user by name and collects address information
   * @param name The user's name
   * @returns The path to the recorded address file
   */
  async collectAddress(name: string): Promise<string> {
    id_list_message(this.call, 'שלום ' + name);
    const addressFilePath = await this.call.read([{ type: 'text', data: 'אנא הקלט את הרחוב בו אתה גר' }], 'record');
    this.logger.log(`Address file path: ${addressFilePath}`);
    return addressFilePath;
  }

  /**
   * Completes the call with a success message and hangs up
   */
  finishCall() {
    id_list_message_with_hangup(this.call, 'תגובתך התקבלה בהצלחה');
  }

  /**
   * Executes the full call handling flow
   */
  async execute() {
    await this.initializeDataSource();
    await this.initialGreeting();
    const name = await this.collectName();
    
    // Handle student identification in a self-contained way
    // If student is not found, this method will terminate the call
    await this.studentHandler.handleStudentIdentification();
    
    // Handle event type selection
    // The user will be prompted to select a valid event type
    await this.eventTypeHandler.handleEventTypeSelection();
    
    // If we reach here, both student identification and event type selection were successful
    await this.collectAddress(name);
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
