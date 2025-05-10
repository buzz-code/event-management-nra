import { SYSTEM_CONSTANTS } from './system-constants';

/**
 * Message constants for the Yemot IVR system
 * Centralizes text messages that were previously scattered throughout the codebase
 */
export const MESSAGE_CONSTANTS = {
  GENERAL: {
    /**
     * General error message
     */
    ERROR: 'אירעה שגיאה, אנא נסי שוב מאוחר יותר',
    
    /**
     * General success message
     */
    SUCCESS: 'תודה על הדיווח. האירוע נשמר בהצלחה במערכת',
    
    /**
     * Invalid input message
     */
    INVALID_INPUT: 'בחירה לא תקינה, אנא נסי שנית',
    
    /**
     * Maximum attempts reached message
     */
    MAX_ATTEMPTS_REACHED: 'מספר נסיונות הבחירה הגיע למקסימום. אנא נסי להתקשר שנית מאוחר יותר.',
  },
  
  AUTHENTICATION: {
    /**
     * Prompt for student ID
     */
    ID_PROMPT: 'הקישי מספר תעודת זהות',
    
    /**
     * Invalid ID message
     */
    INVALID_ID: 'מספר תעודת הזהות שהוקש שגוי, אנא נסי שנית',
    
    /**
     * Student not found message
     */
    STUDENT_NOT_FOUND: 'לא נמצאה תלמידה עם מספר תעודת הזהות שהוקשה, אנא נסי שוב',
  },
  
  MENU: {
    /**
     * Base introduction for the main menu
     */
    MAIN_MENU_BASE: 'אנא בחרי את הפעולה הרצויה:',
    // The full MAIN_MENU string is now constructed dynamically in UserInteractionHandler
  },
  
  EVENT: {
    /**
     * Event already exists message template
     */
    ALREADY_EXISTS: (eventType: string, date: string): string => 
      `נמצא אירוע קיים מסוג ${eventType} בתאריך ${date}. אין אפשרות לשנות אירוע קיים. כדי לשנות אירוע קיים יש ליצור קשר טלפוני בשעות הערב במספר ${SYSTEM_CONSTANTS.SUPPORT_PHONE}`,
    
    /**
     * Event saved successfully message
     */
    SAVE_SUCCESS: 'הפרטים עודכנו בהצלחה, מזל טוב',
    
    /**
     * Event reporting error message
     */
    REPORT_ERROR: 'אירעה שגיאה בתהליך הדיווח. אנא נסי שוב מאוחר יותר.',
  },
  
  PATH: {
    /**
     * Path selection success message
     */
    SELECTION_SUCCESS: 'בחירת המסלול נשמרה בהצלחה',
    
    /**
     * Path selection error message
     */
    SELECTION_ERROR: 'אירעה שגיאה בבחירת המסלול. אנא נסי שוב מאוחר יותר.',
    
    /**
     * Continue to voucher selection prompt
     */
    CONTINUE_TO_VOUCHERS: 'להמשיך לבחירת שוברים',
    
    /**
     * No path selected during an update flow
     */
    NO_PATH_SELECTED: 'לא נבחר מסלול. לא ניתן להמשיך.',
  },
  
  VOUCHER: {
    /**
     * Voucher selection success message
     */
    SELECTION_SUCCESS: 'בחירת השובר נשמרה בהצלחה במערכת',
    
    /**
     * Voucher selection not confirmed message
     */
    SELECTION_NOT_CONFIRMED: 'בחירת השוברים לא אושרה, אנא נסי שוב מאוחר יותר.',
    
    /**
     * Voucher selection error message
     */
    SELECTION_ERROR: 'אירעה שגיאה בבחירת השוברים. אנא נסי שוב מאוחר יותר.',
    
    /**
     * Warning message about finality of voucher selection
     */
    FINAL_WARNING: 'שים/י לב: לאחר אישור בחירת השוברים, לא ניתן יהיה לשנות את הבחירה!',
    
    /**
     * Retry voucher selection message
     */
    RETRY_SELECTION: 'נחזור לבחירת השוברים מההתחלה',
  },
  
  POST_EVENT: {
    /**
     * Post-event update success message
     */
    UPDATE_SUCCESS: 'תודה רבה! המידע על המסלול שהושלם נשמר בהצלחה.',
    
    /**
     * No path selected message
     */
    NO_PATH_SELECTED: 'לא נבחר מסלול שהושלם.',
    
    /**
     * Post-event update error message
     */
    UPDATE_ERROR: 'אירעה שגיאה בעדכון הפרטים. אנא נסי שנית מאוחר יותר.',
  },
};
