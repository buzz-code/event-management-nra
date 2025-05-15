import { DataSource, EntityTarget, Repository } from 'typeorm';
import { Call, TapOptions } from 'yemot-router2';
import { Logger } from '@nestjs/common';
import { MESSAGE_CONSTANTS } from '../constants/message-constants';
import { CallUtils } from './call-utils';

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
 * and forwards all methods to the original Call while adding custom functionality
 */
export function createExtendedCall(call: Call, logger: Logger, dataSource: DataSource): Call {
  // Create a new object that copies all properties and methods from the original call
  const extendedCall = Object.create(Object.getPrototypeOf(call), Object.getOwnPropertyDescriptors(call)) as Call;

  extendedCall.getRepository = function <T>(entityClass: EntityTarget<T>): Repository<T> {
    return dataSource.getRepository(entityClass);
  };

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

  extendedCall.getConfirmation = function (
    message: string,
    yesOption: string = MESSAGE_CONSTANTS.GENERAL.YES_OPTION,
    noOption: string = MESSAGE_CONSTANTS.GENERAL.NO_OPTION,
  ): Promise<boolean> {
    return CallUtils.getConfirmation(extendedCall, message, logger, yesOption, noOption);
  };
  extendedCall.readDigits = function (promptText: string, options: TapOptions): Promise<string> {
    return CallUtils.readDigits(extendedCall, promptText, logger, options);
  };
  extendedCall.playMessage = function (message: string): Promise<void> {
    return CallUtils.playMessage(extendedCall, message, logger);
  };
  extendedCall.hangupWithMessage = function (message: string): Promise<void> {
    return CallUtils.hangupWithMessage(extendedCall, message, logger);
  };

  return extendedCall;
}
