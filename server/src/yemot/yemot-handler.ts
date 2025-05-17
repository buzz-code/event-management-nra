import { Logger } from '@nestjs/common';
import { YemotCallHandler, YemotCallProcessor } from '@shared/utils/yemot/yemot-router';
import { Call } from 'yemot-router2';
import { DataSource } from 'typeorm';
import { getDataSource } from '@shared/utils/entity/foreignKey.util';
import { Student } from 'src/db/entities/Student.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { Event } from 'src/db/entities/Event.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { User } from 'src/db/entities/User.entity';
import { LevelType } from 'src/db/entities/LevelType.entity';
import { EventNote } from 'src/db/entities/EventNote.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';
import { Gift } from 'src/db/entities/Gift.entity';
import { Class } from 'src/db/entities/Class.entity';

// Import refactored components
import { YemotHandlerFactory } from './handlers/yemot-handler-factory';
import { YemotFlowOrchestrator } from './handlers/yemot-flow-orchestrator';
import { createExtendedCall } from './utils/extended-call';

async function createDataSource() {
  // Get a data source with all required entities
  const dataSource = await getDataSource([
    Student,
    EventType,
    Event,
    Teacher,
    User,
    LevelType,
    EventNote,
    EventGift,
    Gift,
    Class,
  ]);

  return dataSource;
}

/**
 * The main Yemot call handler class
 */
export class CallHandler {
  private logger: Logger;
  private call: Call;

  private handlerFactory: YemotHandlerFactory;
  private flowOrchestrator: YemotFlowOrchestrator;

  /**
   * Constructor for the CallHandler class
   * @param logger Logger instance for logging call-related information
   * @param call The Yemot call object
   */
  constructor(logger: Logger, call: Call) {
    this.logger = logger;
    this.call = call;
    this.logger.log(`Handling call from ${this.call.phone}`);
  }

  /**
   * Initializes required components
   */
  async initializeRequiredComponents() {
    const dataSource = await createDataSource();
    this.logger.log('Data source initialized');

    // Create an extended call with enhanced datasource access and context management
    const extendedCall = createExtendedCall(this.call, this.logger, dataSource);

    // Create handlers using the enhanced extended call
    this.logger.log('Using enhanced ExtendedCall with centralized data access');
    this.handlerFactory = new YemotHandlerFactory(extendedCall);
    this.flowOrchestrator = new YemotFlowOrchestrator(extendedCall, this.handlerFactory);
  }

  /**
   * Finds the user based on the phone number using the enhanced ExtendedCall
   */
  async findUser(): Promise<void> {
    // Use the centralized data access method directly
    const user = await this.call.findUserByPhone();
    if (!user) {
      this.logger.error(`User not found for phone number: ${this.call.did}`);
      throw new Error(`User not found for phone number: ${this.call.did}`);
    }

    // Note that user ID and context are already set by findUserByPhone
  }

  /**
   * Executes the call flow
   */
  async execute(): Promise<void> {
    try {
      // Initialize the data source and create the enhanced ExtendedCall
      await this.initializeRequiredComponents();

      // Find and verify the user
      await this.findUser();

      // Execute the main flow using the orchestrator with our enhanced ExtendedCall
      await this.flowOrchestrator.execute();
    } catch (error) {
      this.logger.error(`Error executing call flow: ${error.message}`);

      await this.call.hangupWithMessage(this.call.getText('GENERAL.ERROR'));
    }
  }
}

/**
 * The exported Yemot call handler function
 */
export const yemotHandler: YemotCallHandler = (logger) => async (call) => {
  const handler = new CallHandler(logger, call);
  return handler.execute();
};

/**
 * The exported Yemot call processor function
 */
export const yemotProcessor: YemotCallProcessor = async (call, logger) => {
  logger.log(`Processing call ${call.callId} from ${call.phone}`);
  // Here you can add any additional processing logic you need
};
