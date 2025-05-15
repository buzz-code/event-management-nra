import { Logger } from '@nestjs/common';
import {
  YemotCallHandler,
  YemotCallProcessor,
} from '@shared/utils/yemot/yemot-router';
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

/**
 * The main Yemot call handler class
 */
export class CallHandler {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;

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
   * Initializes the data source and required components
   */
  async initializeDataSource(): Promise<void> {
    // Get a data source with all required entities
    this.dataSource = await getDataSource([
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

    this.logger.log('Data source initialized successfully');

    // Create the handler factory and flow orchestrator
    this.logger.log('Using refactored components');

    this.handlerFactory = new YemotHandlerFactory(this.dataSource, this.call);
    const extendedCall = createExtendedCall(
      this.call,
      this.logger,
      this.dataSource,
    );
    this.flowOrchestrator = new YemotFlowOrchestrator(
      extendedCall,
      this.handlerFactory,
    );
  }

  /**
   * Executes the call flow
   */
  async execute(): Promise<void> {
    try {
      await this.initializeDataSource();

      // Execute the main flow using the orchestrator
      await this.flowOrchestrator.execute();
    } catch (error) {
      this.logger.error(`Error executing call flow: ${error.message}`);
      // Any unhandled exceptions - flow orchestrator should handle most errors
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
