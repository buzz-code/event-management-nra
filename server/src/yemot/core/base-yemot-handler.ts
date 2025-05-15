import { Logger } from '@nestjs/common';
import { Call } from 'yemot-router2';
import { DataSource } from 'typeorm';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';

/**
 * Interface for options when reading digits from the call
 */
export interface ReadDigitsOptions {
  max_digits: number;
  min_digits?: number;
  digits_allowed?: string[];
  timeout?: number;
}

/**
 * Abstract base class for all Yemot handlers
 * Updated to work with the enhanced ExtendedCall for centralized data access
 * Provides common functionality for call handling and flow logic
 */
export abstract class BaseYemotHandler {
  protected call: Call;
  protected maxRetries = 3; // Default retry count, can be overridden

  /**
   * Constructor for the BaseYemotHandler
   * @param call The enhanced Yemot call object with data access capabilities
   */
  constructor(call: Call) {
    this.call = call;
  }

  /**
   * Reads digits from the user with the provided prompt and options
   * @param promptText The text to prompt the user with
   * @param options Options for reading digits
   * @returns The digits entered by the user
   */
  protected async readDigits(promptText: string, options: ReadDigitsOptions): Promise<string> {
    return await this.call.readDigits(promptText, options);
  }

  /**
   * Plays a message to the user
   * @param message The message to play
   */
  protected async playMessage(message: string): Promise<void> {
    return await this.call.playMessage(message);
  }

  /**
   * Plays a message to the user and then hangs up
   * @param message The message to play before hanging up
   */
  protected async hangupWithMessage(message: string): Promise<void> {
    return await this.call.hangupWithMessage(message);
  }

  /**
   * Gets confirmation from the user (yes/no question)
   * @param prompt The prompt message asking for confirmation
   * @param yesOption Text for the "yes" option (default: "לאישור הקישי 1")
   * @param noOption Text for the "no" option (default: "לביטול הקישי 2")
   * @returns True if confirmed, false otherwise
   */
  protected async getConfirmation(
    prompt: string,
    yesOption: string = MESSAGE_CONSTANTS.GENERAL.YES_OPTION,
    noOption: string = MESSAGE_CONSTANTS.GENERAL.NO_OPTION,
  ): Promise<boolean> {
    return await this.call.getConfirmation(prompt, yesOption, noOption);
  }

  /**
   * Executes an operation with retry logic
   * Uses the enhanced ExtendedCall's withRetry method directly
   * 
   * @param operation Function to execute
   * @param retryMessage Message to display when retrying
   * @param errorMessage Message to display on failure
   * @param maxAttempts Maximum number of attempts (default: this.maxRetries)
   * @returns The result of the operation
   * @throws Error if the operation fails after all retries
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    retryMessage: string,
    errorMessage: string,
    maxAttempts: number = this.maxRetries,
  ): Promise<T> {
    // Directly use the enhanced ExtendedCall's withRetry method
    return await this.call.withRetry(operation, {
      retryMessage,
      errorMessage,
      maxAttempts
    });
  }

  /**
   * Helper for logging that an operation is starting
   * @param methodName The name of the method that is starting
   */
  protected logStart(methodName: string): void {
    this.call.logDebug(`Starting ${this.constructor.name}.${methodName}`);
  }

  /**
   * Helper for logging that an operation has completed
   * @param methodName The name of the method that has completed
   * @param result Optional result or status message to include in the log
   */
  protected logComplete(methodName: string, result?: any): void {
    const resultMsg = result ? ` with result: ${JSON.stringify(result)}` : '';
    this.call.logDebug(`Completed ${this.constructor.name}.${methodName}${resultMsg}`);
  }

  /**
   * Helper for logging errors
   * @param methodName The name of the method where the error occurred
   * @param error The error that occurred
   */
  protected logError(methodName: string, error: Error): void {
    this.call.logError(`Error in ${this.constructor.name}.${methodName}: ${error.message}`, error.stack);
  }
}
