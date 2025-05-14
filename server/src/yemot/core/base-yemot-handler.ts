import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { DataSource } from "typeorm";
import { id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";

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
 * Provides common functionality for call handling, logging, and database operations
 */
export abstract class BaseYemotHandler {
  protected logger: Logger;
  protected call: Call;
  protected dataSource: DataSource;
  protected maxRetries = 3; // Default retry count, can be overridden

  /**
   * Constructor for the BaseYemotHandler
   * @param logger Logger instance for logging
   * @param call The Yemot call object
   * @param dataSource The initialized data source (optional)
   */
  constructor(logger: Logger, call: Call, dataSource?: DataSource) {
    this.logger = logger;
    this.call = call;
    
    if (dataSource) {
      this.dataSource = dataSource;
    }
  }

  /**
   * Reads digits from the user with the provided prompt and options
   * @param promptText The text to prompt the user with
   * @param options Options for reading digits
   * @returns The digits entered by the user
   */
  protected async readDigits(promptText: string, options: ReadDigitsOptions): Promise<string> {
    this.logger.debug(`Reading digits with prompt: ${promptText}`);
    return await this.call.read([{ type: 'text', data: promptText }], 'tap', options);
  }

  /**
   * Plays a message to the user
   * @param message The message to play
   */
  protected async playMessage(message: string): Promise<void> {
    this.logger.debug(`Playing message: ${message}`);
    await id_list_message(this.call, message);
  }

  /**
   * Plays a message to the user and then hangs up
   * @param message The message to play before hanging up
   */
  protected async hangupWithMessage(message: string): Promise<void> {
    this.logger.debug(`Hanging up with message: ${message}`);
    await id_list_message_with_hangup(this.call, message);
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
    yesOption: string = "לאישור הקישי 1",
    noOption: string = "לביטול הקישי 2"
  ): Promise<boolean> {
    const message = `${prompt} ${yesOption}, ${noOption}`;
    const response = await this.readDigits(message, {
      max_digits: 1,
      min_digits: 1,
      digits_allowed: ['1', '2']
    });
    
    return response === '1';
  }

  /**
   * Executes an operation with retry logic
   * @param operation Function to execute
   * @param errorMessage Message to display on failure
   * @param retryMessage Message to display when retrying
   * @param maxAttempts Maximum number of attempts (default: this.maxRetries)
   * @returns The result of the operation
   * @throws Error if the operation fails after all retries
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    retryMessage: string,
    errorMessage: string,
    maxAttempts: number = this.maxRetries
  ): Promise<T> {
    let attempts = 0;
    let lastError: Error | null = null;
    
    while (attempts < maxAttempts) {
      try {
        return await operation();
      } catch (error) {
        attempts++;
        lastError = error;
        this.logger.warn(`Operation failed (attempt ${attempts}/${maxAttempts}): ${error.message}`);
        
        if (attempts >= maxAttempts) {
          break;
        }
        
        await this.playMessage(retryMessage);
      }
    }
    
    this.logger.error(`Operation failed after ${maxAttempts} attempts: ${lastError?.message}`);
    await this.hangupWithMessage(errorMessage);
  }

  /**
   * Logs the start of a handler operation
   * @param operation Name of the operation
   */
  protected logStart(operation: string): void {
    this.logger.log(`Starting ${this.constructor.name}.${operation}`);
  }

  /**
   * Logs the completion of a handler operation
   * @param operation Name of the operation
   * @param result Optional result information
   */
  protected logComplete(operation: string, result?: any): void {
    if (result) {
      this.logger.log(`Completed ${this.constructor.name}.${operation}: ${JSON.stringify(result)}`);
    } else {
      this.logger.log(`Completed ${this.constructor.name}.${operation}`);
    }
  }

  /**
   * Logs an error that occurred during a handler operation
   * @param operation Name of the operation
   * @param error The error that occurred
   */
  protected logError(operation: string, error: Error): void {
    this.logger.error(`Error in ${this.constructor.name}.${operation}: ${error.message}`, error.stack);
  }
}