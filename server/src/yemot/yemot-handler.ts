import { YemotCallHandler, YemotCallProcessor } from '@shared/utils/yemot/yemot-router';
import { Call } from 'yemot-router2';
import { Student } from 'src/db/entities/Student.entity';
import { EventType } from 'src/db/entities/EventType.entity';
import { Event } from 'src/db/entities/Event.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { LevelType } from 'src/db/entities/LevelType.entity';
import { EventNote } from 'src/db/entities/EventNote.entity';
import { EventGift } from 'src/db/entities/EventGift.entity';
import { Gift } from 'src/db/entities/Gift.entity';
import { Class } from 'src/db/entities/Class.entity';

// Import refactored components
import { YemotHandlerFactory } from './handlers/yemot-handler-factory';
import { YemotFlowOrchestrator } from './handlers/yemot-flow-orchestrator';
import { createExtendedCall } from './utils/extended-call';
import { MESSAGE_CONSTANTS } from './constants/message-constants';
import { User } from 'src/db/entities/User.entity';

/**
 * The main Yemot call handler class
 */
export class CallHandler {
  private call: Call;

  private handlerFactory: YemotHandlerFactory;
  private flowOrchestrator: YemotFlowOrchestrator;

  /**
   * Constructor for the CallHandler class
   * @param call The Yemot call object (already extended with base functionality)
   */
  constructor(call: Call) {
    this.call = call;
    this.call.logInfo(`Handling call from ${this.call.phone}`);
  }

  /**
   * Initializes required components
   */
  async initializeRequiredComponents() {

    // Create application-specific extended call with additional functionality
    this.call = createExtendedCall(this.call);

    // Create handlers using the enhanced extended call
    this.call.logInfo('Using enhanced ExtendedCall with centralized data access');
    this.handlerFactory = new YemotHandlerFactory(this.call);
    this.flowOrchestrator = new YemotFlowOrchestrator(this.call, this.handlerFactory);
  }

  /**
   * Finds the user based on the phone number using the enhanced ExtendedCall
   */
  async findUser(): Promise<void> {
    // Use the centralized data access method directly
    const user = await this.call.findUserByPhone();
    if (!user) {
      this.call.logError(`User not found for phone number: ${this.call.did}`);
      this.call.hangupWithMessage(this.call.getText('GENERAL.USER_NOT_FOUND'));
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
      this.call.logError(`Error executing call flow: ${error.message}`);

      await this.call.hangupWithMessage(this.call.getText('GENERAL.ERROR'));
    }
  }
}

/**
 * The exported Yemot call handler function
 */
export const yemotHandler: YemotCallHandler = async (call) => {
  const handler = new CallHandler(call);
  return handler.execute();
};

/**
 * The exported Yemot call processor function
 */
export const yemotProcessor: YemotCallProcessor = async (call) => {
  call.logInfo(`Processing call ${call.callId} from ${call.phone}`);
  // Here you can add any additional processing logic you need
};

export const yemotEntities = [
  User,
  Student,
  EventType,
  Event,
  Teacher,
  LevelType,
  EventNote,
  EventGift,
  Gift,
  Class,
];

export const messageConstants = MESSAGE_CONSTANTS;