import { SYSTEM_CONSTANTS } from './system-constants';

function formatString(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{\{([a-zA-Z0-9_\-\.]+)\}\}/g, (_, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : key;
  });
}

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

    /**
     * User not found message
     */
    USER_NOT_FOUND: 'תקלה, המערכת לא מחוברת.',

    /**
     * Welcome message with student name
     */
    WELCOME: (name: string): string => formatString('שלום {{name}}, ברוכה הבאה למערכת הדיווח האוטומטית.', { name }),

    /**
     * Yes option for confirmation prompts
     */
    YES_OPTION: 'לאישור הקישי 1',

    /**
     * No option for confirmation prompts
     */
    NO_OPTION: 'לביטול הקישי 2',
  },

  SELECTION: {
    /**
     * No options available message
     */
    NO_OPTIONS: (entityName: string): string => formatString('אין אפשרויות {{entityName}} במערכת כרגע. אנא פנה למנהל המערכת.', { entityName }),

    /**
     * Selection summary message
     */
    SELECTION_SUMMARY: (selectedNames: string): string => formatString('בחרת ב: {{selectedNames}}', { selectedNames }),

    /**
     * Last selection message
     */
    LAST_SELECTION: (entityName: string, itemName: string): string => formatString('בחרת ב{{entityName}}: {{itemName}}.', { entityName, itemName }),

    /**
     * Continue selection option
     */
    CONTINUE_OPTION: 'לבחירה נוספת הקישי 1',

    /**
     * Finish selection option
     */
    FINISH_OPTION: 'לסיום הקישי 2',

    /**
     * Maximum selections reached message
     */
    MAX_SELECTIONS_REACHED: (maxSelections: number): string => formatString('הגעת למקסימום של {{maxSelections}} אפשרויות בחירה', { maxSelections }),

    /**
     * Confirm selection option
     */
    CONFIRM_OPTION: 'לאישור הבחירה הקישי 1',

    /**
     * Restart selection option
     */
    RESTART_OPTION: 'לבחירה מחדש הקישי 2',

    /**
     * Restart selection message
     */
    RESTART_MESSAGE: (entityName: string): string => formatString('נחזור לבחירת ה{{entityName}} מההתחלה', { entityName }),

    /**
     * Already selected message
     */
    ALREADY_SELECTED: (entityName: string, itemName: string): string =>
      formatString('ה{{entityName}} {{itemName}} כבר נבחר. אנא בחר אפשרות אחרת.', { entityName, itemName }),

    /**
     * Selection prompt
     */
    PROMPT: (entityName: string, options: string): string =>
      formatString('אנא בחר {{entityName}} על ידי הקשת המספר המתאים: {{options}}', { entityName, options }),

    /**
     * Auto-selected message
     */
    AUTO_SELECTED: (entityName: string, itemName: string): string => formatString('מצאנו {{entityName}} אחד זמין: {{itemName}}', { entityName, itemName }),

    /**
     * Auto-selected event for selection message
     */
    AUTO_SELECTED_FOR_SELECTION: (entityName: string, itemName: string): string =>
      formatString('מצאנו {{entityName}} אחד זמין לבחירה: {{itemName}}', { entityName, itemName }),

    /**
     * Auto-selected event for update message
     */
    AUTO_SELECTED_FOR_UPDATE: (itemName: string): string => formatString('מצאנו אירוע אחד זמין לעדכון: {{itemName}}', { itemName }),

    /**
     * Path selection prompt
     */
    PATH_SELECTION_PROMPT: (options: string): string => formatString('אנא בחרי את המסלול על ידי הקשת המספר המתאים: {{options}}', { options }),

    /**
     * Current item message
     */
    CURRENT_ITEM: (entityName: string, itemName: string): string => formatString('ה{{entityName}} הנוכחי הוא: {{itemName}}', { entityName, itemName }),

    /**
     * Change selection prompt
     */
    CHANGE_PROMPT: (entityName: string): string => formatString('האם ברצונך לשנות את ה{{entityName}}?', { entityName }),

    /**
     * Change selection option
     */
    CHANGE_OPTION: 'לשינוי הקישי 1',

    /**
     * Keep selection option
     */
    KEEP_OPTION: 'להשארת הבחירה הנוכחית הקישי 2',
  },

  DATE: {
    /**
     * Day selection prompt
     */
    DAY_PROMPT: 'אנא הקש את היום בחודש. לדוגמה, עבור כ״ז הקש 27',

    /**
     * Invalid day error
     */
    INVALID_DAY: 'היום שהוקש אינו תקין',

    /**
     * Month selection prompt
     */
    MONTH_PROMPT: (options: string): string => formatString('אנא הקש את מספר החודש העברי, {{options}}.', { options }),

    /**
     * Invalid month error
     */
    INVALID_MONTH: (maxMonth: number): string => formatString('החודש שהוקש אינו תקין. אנא הקש מספר בין 1 ל-{{maxMonth}}.', { maxMonth }),

    /**
     * Date confirmation message
     */
    CONFIRM_DATE: (date: string): string => formatString('תאריך השמחה שנבחר הוא {{date}}.', { date }),

    /**
     * Confirmation yes prompt for date
     */
    CONFIRM_YES: 'אם זה נכון, הקש 1',

    /**
     * Confirmation no prompt for date
     */
    CONFIRM_NO: 'אם ברצונך לשנות, הקש 2',
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

    /**
     * Menu option descriptions
     */
    MENU_OPTIONS: {
      EVENT_REPORTING: (option: string): string => formatString('לדיווח על אירוע הקישי {{option}}', { option }),
      PATH_SELECTION: (option: string): string => formatString('לבחירת מסלול ראשונית הקישי {{option}}', { option }),
      VOUCHER_SELECTION: (option: string): string => formatString('לבחירת שוברים ראשונית הקישי {{option}}', { option }),
      POST_EVENT_UPDATE: (option: string): string => formatString('לעדכון פרטי מסלול לאחר אירוע הקישי {{option}}', { option }),
      EXIT: (option: string): string => formatString('לסיום הקישי {{option}}', { option }),
    },

    /**
     * Menu option confirmations
     */
    MENU_CONFIRMATIONS: {
      EVENT_REPORTING: 'בחרת בדיווח על אירוע חדש',
      PATH_SELECTION: 'בחרת בבחירת מסלול',
      VOUCHER_SELECTION: 'בחרת בבחירת שוברים',
      POST_EVENT_UPDATE: 'בחרת בעדכון לאחר אירוע',
      EXIT: 'בחרת לסיים את השיחה',
    },
  },

  EVENT: {
    /**
     * Event already exists message template
     */
    ALREADY_EXISTS: (eventType: string, date: string): string =>
      formatString('נמצא אירוע קיים מסוג {{eventType}} בתאריך {{date}}. אין אפשרות לשנות אירוע קיים. כדי לשנות אירוע קיים יש ליצור קשר טלפוני בשעות הערב במספר {{supportPhone}}', { eventType, date, supportPhone: SYSTEM_CONSTANTS.SUPPORT_PHONE }),

    /**
     * Event saved successfully message
     */
    SAVE_SUCCESS: 'הפרטים עודכנו בהצלחה, מזל טוב',

    /**
     * Event reporting error message
     */
    REPORT_ERROR: 'אירעה שגיאה בתהליך הדיווח. אנא נסי שוב מאוחר יותר.',

    /**
     * Event type selection confirmation
     */
    TYPE_SELECTED: (eventTypeName: string): string => formatString('בחרת באירוע מסוג {{eventTypeName}}', { eventTypeName }),

    /**
     * Event type selection prompt
     */
    TYPE_SELECTION_PROMPT: (options: string): string => formatString('בחרי את סוג האירוע: {{options}}', { options }),
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

    /**
     * Current vouchers message
     */
    CURRENT_VOUCHERS: (voucherNames: string): string => formatString('השוברים הנוכחיים שלך הם: {{voucherNames}}', { voucherNames }),

    /**
     * Change vouchers prompt
     */
    CHANGE_PROMPT: 'האם ברצונך לשנות את בחירת השוברים?',

    /**
     * Change selection option
     */
    CHANGE_OPTION: 'לשינוי הבחירה הקישי 1',

    /**
     * Keep selection option
     */
    KEEP_OPTION: 'להשארת הבחירה הנוכחית הקישי 2',

    /**
     * Voucher selection prompt
     */
    SELECTION_PROMPT: (options: string): string => formatString('אנא בחרי שובר על ידי הקשת המספר המתאים: {{options}}', { options }),
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
