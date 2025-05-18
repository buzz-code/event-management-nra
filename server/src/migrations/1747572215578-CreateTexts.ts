import { MigrationInterface, QueryRunner } from "typeorm";
import { Text } from "@shared/entities/Text.entity";

const MESSAGE_CONSTANTS = {
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
        WELCOME: 'שלום {name}, ברוכה הבאה למערכת הדיווח האוטומטית.',

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
        NO_OPTIONS: 'אין אפשרויות {entityName} במערכת כרגע. אנא פנה למנהל המערכת.',

        /**
         * Selection summary message
         */
        SELECTION_SUMMARY: 'בחרת ב: {selectedNames}',

        /**
         * Last selection message
         */
        LAST_SELECTION: 'בחרת ב{entityName}: {itemName}.',

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
        MAX_SELECTIONS_REACHED: 'הגעת למקסימום של {maxSelections} אפשרויות בחירה',

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
        RESTART_MESSAGE: 'נחזור לבחירת ה{entityName} מההתחלה',

        /**
         * Already selected message
         */
        ALREADY_SELECTED: 'ה{entityName} {itemName} כבר נבחר. אנא בחר אפשרות אחרת.',

        /**
         * Selection prompt
         */
        PROMPT: 'אנא בחר {entityName} על ידי הקשת המספר המתאים: {options}',

        /**
         * Auto-selected message
         */
        AUTO_SELECTED: 'מצאנו {entityName} אחד זמין: {itemName}',

        /**
         * Auto-selected event for selection message
         */
        AUTO_SELECTED_FOR_SELECTION: 'מצאנו {entityName} אחד זמין לבחירה: {itemName}',

        /**
         * Auto-selected event for update message
         */
        AUTO_SELECTED_FOR_UPDATE: 'מצאנו אירוע אחד זמין לעדכון: {itemName}',

        /**
         * Path selection prompt
         */
        PATH_SELECTION_PROMPT: 'אנא בחרי את המסלול על ידי הקשת המספר המתאים: {options}',

        /**
         * Current item message
         */
        CURRENT_ITEM: 'ה{entityName} הנוכחי הוא: {itemName}',

        /**
         * Change selection prompt
         */
        CHANGE_PROMPT: 'האם ברצונך לשנות את ה{entityName}?',

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
        MONTH_PROMPT: 'אנא הקש את מספר החודש העברי, {options}.',

        /**
         * Invalid month error
         */
        INVALID_MONTH: 'החודש שהוקש אינו תקין. אנא הקש מספר בין 1 ל-{maxMonth}.',

        /**
         * Date confirmation message
         */
        CONFIRM_DATE: 'תאריך השמחה שנבחר הוא {date}.',

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
            EVENT_REPORTING: 'לדיווח על אירוע הקישי {option}',
            PATH_SELECTION: 'לבחירת מסלול ראשונית הקישי {option}',
            VOUCHER_SELECTION: 'לבחירת שוברים ראשונית הקישי {option}',
            POST_EVENT_UPDATE: 'לעדכון פרטי מסלול לאחר אירוע הקישי {option}',
            EXIT: 'לסיום הקישי {option}',
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
        ALREADY_EXISTS: 'נמצא אירוע קיים מסוג {eventType} בתאריך {date}. אין אפשרות לשנות אירוע קיים. כדי לשנות אירוע קיים יש ליצור קשר טלפוני בשעות הערב במספר {supportPhone}',

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
        TYPE_SELECTED: 'בחרת באירוע מסוג {eventTypeName}',

        /**
         * Event type selection prompt
         */
        TYPE_SELECTION_PROMPT: 'בחרי את סוג האירוע: {options}',
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
        CURRENT_VOUCHERS: 'השוברים הנוכחיים שלך הם: {voucherNames}',

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
        SELECTION_PROMPT: 'אנא בחרי שובר על ידי הקשת המספר המתאים: {options}',
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

export class CreateTexts1747572215578 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`texts\` CHANGE \`description\` \`description\` varchar(500) NOT NULL
        `);
        for (const [key, value] of Object.entries(MESSAGE_CONSTANTS)) {
            await this.createText(queryRunner, key, value);
        }
    }

    private async createText(queryRunner: QueryRunner, key: string, value: any): Promise<void> {
        if (typeof value !== 'string') {
            for (const [subKey, subValue] of Object.entries(value || {})) {
                await this.createText(queryRunner, `${key}.${subKey}`, subValue);
            }
            return;
        }
        await queryRunner.manager.getRepository(Text).insert({
            name: key,
            description: value,
            value,
            userId: 0,
        });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`texts\` CHANGE \`description\` \`description\` varchar(100) NOT NULL
        `);
    }

}
