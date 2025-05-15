/**
 * System-wide constants for the Yemot IVR system
 * Centralizes configuration values that were previously scattered throughout the codebase
 */
export const SYSTEM_CONSTANTS = {
  /**
   * Maximum number of retry attempts for user inputs
   */
  MAX_RETRIES: 3,

  /**
   * Support phone number for users to call for modifications
   */
  SUPPORT_PHONE: '0533152632',

  /**
   * Maximum number of vouchers that can be selected
   */
  MAX_VOUCHERS: 3,

  /**
   * Maximum number of digits for ID input
   */
  MAX_ID_DIGITS: 9,

  /**
   * Default timeout for user input (in milliseconds)
   */
  INPUT_TIMEOUT: 10000,
};
