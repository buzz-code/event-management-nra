import { Logger } from "@nestjs/common";
import { YemotCallHandler, YemotCallProcessor } from "@shared/utils/yemot/yemot-router";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { getDataSource } from "@shared/utils/entity/foreignKey.util";
import { Student } from "src/db/entities/Student.entity";
import { EventType } from "src/db/entities/EventType.entity";
import { Event } from "src/db/entities/Event.entity";
import { Teacher } from "src/db/entities/Teacher.entity";
import { User } from "src/db/entities/User.entity";
import { LevelType } from "src/db/entities/LevelType.entity";
import { EventNote } from "src/db/entities/EventNote.entity";
import { EventGift } from "src/db/entities/EventGift.entity";
import { Gift } from "src/db/entities/Gift.entity";
import { Class } from "src/db/entities/Class.entity";

// Import both original and refactored components
import { YemotHandlerFactory } from "./core/yemot-handler-factory";
import { YemotFlowOrchestrator } from "./core/yemot-flow-orchestrator";
import { YemotHandlerFactoryV2 } from "./handlers-v2/yemot-handler-factory-v2";
import { YemotFlowOrchestratorV2 } from "./handlers-v2/yemot-flow-orchestrator-v2";

// Feature flag to control which version to use
const USE_REFACTORED_VERSION = true;

/**
 * The main Yemot call handler class
 * Can use either the original or refactored components based on a feature flag
 */
export class CallHandlerV2 {
  private logger: Logger;
  private call: Call;
  private dataSource: DataSource;
  
  // Will use either original or refactored components
  private handlerFactory: YemotHandlerFactory | YemotHandlerFactoryV2;
  private flowOrchestrator: YemotFlowOrchestrator | YemotFlowOrchestratorV2;

  /**
   * Constructor for the CallHandlerV2 class
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
      Class
    ]);
    
    this.logger.log('Data source initialized successfully');
    
    // Create the handler factory and flow orchestrator based on the feature flag
    if (USE_REFACTORED_VERSION) {
      this.logger.log('Using refactored components (V2)');
      
      // Use the refactored components
      this.handlerFactory = new YemotHandlerFactoryV2(this.dataSource);
      this.flowOrchestrator = new YemotFlowOrchestratorV2(
        this.logger, 
        this.call, 
        this.handlerFactory as YemotHandlerFactoryV2
      );
    } else {
      this.logger.log('Using original components');
      
      // Use the original components
      this.handlerFactory = new YemotHandlerFactory(this.dataSource);
      this.flowOrchestrator = new YemotFlowOrchestrator(
        this.logger, 
        this.call, 
        this.handlerFactory as YemotHandlerFactory
      );
    }
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
export const yemotHandlerV2: YemotCallHandler = (logger) => async (call) => {
  const handler = new CallHandlerV2(logger, call);
  return handler.execute();
};

/**
 * The exported Yemot call processor function
 */
export const yemotProcessorV2: YemotCallProcessor = async (call, logger) => {
  logger.log(`Processing call ${call.callId} from ${call.phone}`);
  // Here you can add any additional processing logic you need
};