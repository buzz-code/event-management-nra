import { DataSource, EntityTarget, Repository } from 'typeorm';
import { Call, TapOptions } from 'yemot-router2';
import { Logger } from '@nestjs/common';
import { id_list_message, id_list_message_with_hangup } from '@shared/utils/yemot/yemot-router';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';

declare module 'yemot-router2' {
  interface Call {
    userId?: number;
    getRepository<T>(entityClass: EntityTarget<T>): Repository<T>;
    logInfo(message: string): void;
    logDebug(message: string): void;
    logWarn(message: string): void;
    logError(message: string, stack?: string): void;
    getConfirmation(message: string, yesOption?: string, noOption?: string): Promise<boolean>;
    readDigits(promptText: string, options: TapOptions): Promise<string>;
    playMessage(message: string): Promise<void>;
    hangupWithMessage(message: string): Promise<void>;
  }
}

/**
 * Factory function that creates an ExtendedCall which implements the Call interface
 * and adds custom functionality directly (no forwarding to CallUtils)
 */
export function createExtendedCall(call: Call, logger: Logger, dataSource: DataSource): Call {
  // Create a new object that copies all properties and methods from the original call
  const extendedCall = Object.create(Object.getPrototypeOf(call), Object.getOwnPropertyDescriptors(call)) as Call;

  // Database Repository access
  extendedCall.getRepository = function <T>(entityClass: EntityTarget<T>): Repository<T> {
    return dataSource.getRepository(entityClass);
  };

  // Enhanced Logging capabilities
  extendedCall.logInfo = function (message: string): void {
    logger.log(`[Call ${extendedCall.callId}] ${message}`);
  };
  extendedCall.logDebug = function (message: string): void {
    logger.debug(`[Call ${extendedCall.callId}] ${message}`);
  };
  extendedCall.logWarn = function (message: string): void {
    logger.warn(`[Call ${extendedCall.callId}] ${message}`);
  };
  extendedCall.logError = function (message: string, stack?: string): void {
    logger.error(`[Call ${extendedCall.callId}] ${message}`, stack);
  };

  // Call interaction methods (implemented directly, no forwarding to CallUtils)
  extendedCall.getConfirmation = async function (
    message: string,
    yesOption: string = MESSAGE_CONSTANTS.GENERAL.YES_OPTION,
    noOption: string = MESSAGE_CONSTANTS.GENERAL.NO_OPTION,
  ): Promise<boolean> {
    extendedCall.logDebug(`Getting confirmation: ${message}`);
    const promptMessage = `${message} ${yesOption}, ${noOption}`;

    const response = await extendedCall.read([{ type: 'text', data: promptMessage }], 'tap', {
      max_digits: 1,
      min_digits: 1,
      digits_allowed: ['1', '2'],
    }) as string;

    const confirmed = response === '1';
    extendedCall.logDebug(`Confirmation response: ${confirmed ? 'Yes' : 'No'}`);
    return confirmed;
  };
  
  extendedCall.readDigits = async function (promptText: string, options: TapOptions): Promise<string> {
    extendedCall.logDebug(`Reading digits with prompt: ${promptText}`);
    const result = await extendedCall.read([{ type: 'text', data: promptText }], 'tap', options) as string;
    extendedCall.logDebug(`Digits entered: ${result}`);
    return result;
  };
  
  extendedCall.playMessage = async function (message: string): Promise<void> {
    extendedCall.logDebug(`Playing message: ${message}`);
    await id_list_message(extendedCall, message);
  };
  
  extendedCall.hangupWithMessage = async function (message: string): Promise<void> {
    extendedCall.logDebug(`Hanging up with message: ${message}`);
    await id_list_message_with_hangup(extendedCall, message);
  };

  return extendedCall;
}
