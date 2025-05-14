import { Logger } from "@nestjs/common";
import { Call } from "yemot-router2";
import { id_list_message, id_list_message_with_hangup } from "@shared/utils/yemot/yemot-router";
import { SYSTEM_CONSTANTS } from "../constants/system-constants";
import { MESSAGE_CONSTANTS } from "../constants/message-constants";

/**
 * Utility class for common call-related operations
 * Extracts duplicated call interaction patterns into reusable methods
 */
export class CallUtils {
  /**
   * Gets confirmation from the user (yes/no question)
   * @param call The Yemot call object
   * @param message The prompt message asking for confirmation
   * @param logger Logger for logging the interaction
   * @param yesOption Text for the "yes" option (default: "לאישור הקישי 1")
   * @param noOption Text for the "no" option (default: "לביטול הקישי 2")
   * @returns True if confirmed (pressed 1), false otherwise (pressed 2)
   */
  static async getConfirmation(
    call: Call,
    message: string,
    logger: Logger,
    yesOption: string = MESSAGE_CONSTANTS.GENERAL.YES_OPTION,
    noOption: string = MESSAGE_CONSTANTS.GENERAL.NO_OPTION
  ): Promise<boolean> {
    logger.debug(`Getting confirmation: ${message}`);
    const promptMessage = `${message} ${yesOption}, ${noOption}`;
    
    const response = await call.read(
      [{ type: 'text', data: promptMessage }],
      'tap',
      {
        max_digits: 1,
        min_digits: 1,
        digits_allowed: ['1', '2']
      }
    ) as string;
    
    const confirmed = response === '1';
    logger.debug(`Confirmation response: ${confirmed ? 'Yes' : 'No'}`);
    
    return confirmed;
  }

  /**
   * Reads digits from the user with the provided prompt
   * @param call The Yemot call object
   * @param promptText The text to prompt the user with
   * @param logger Logger for logging the interaction
   * @param options Options for reading digits
   * @returns The digits entered by the user
   */
  static async readDigits(
    call: Call,
    promptText: string,
    logger: Logger,
    options: {
      max_digits: number,
      min_digits?: number,
      digits_allowed?: string[]
    }
  ): Promise<string> {
    logger.debug(`Reading digits with prompt: ${promptText}`);
    
    const result = await call.read(
      [{ type: 'text', data: promptText }],
      'tap',
      options
    ) as string;
    
    logger.debug(`Digits entered: ${result}`);
    return result;
  }

  /**
   * Plays a message to the user
   * @param call The Yemot call object
   * @param message The message to play
   * @param logger Logger for logging the interaction
   */
  static async playMessage(call: Call, message: string, logger: Logger): Promise<void> {
    logger.debug(`Playing message: ${message}`);
    await id_list_message(call, message);
  }

  /**
   * Plays a message to the user and then hangs up
   * @param call The Yemot call object
   * @param message The message to play before hanging up
   * @param logger Logger for logging the interaction
   */
  static async hangupWithMessage(call: Call, message: string, logger: Logger): Promise<void> {
    logger.debug(`Hanging up with message: ${message}`);
    await id_list_message_with_hangup(call, message);
  }
}