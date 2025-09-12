import { MigrationInterface, QueryRunner } from "typeorm"

export class AddLotteryTexts1757664897376 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Insert lottery-related texts
        await queryRunner.query(`
            INSERT INTO texts (name, value, description, user_id) VALUES
            ('LOTTERY.WELCOME', 'שלום {name}, ברוכה הבאה לכניסה להגרלה.', 'הודעת ברוכה הבאה לכניסה להגרלה', 0),
            ('LOTTERY.TRACK_SELECTION', 'לאיזה מסלול הגרלה את רוצה להכנס? מסלול 1 הקישי 1, מסלול 2 הקישי 2, מסלול 3 הקישי 3', 'בחירת מסלול הגרלה', 0),
            ('LOTTERY.INVALID_TRACK', 'מסלול לא תקין, אנא בחרי מסלול בין 1 ל-3', 'הודעת שגיאה למסלול לא תקין', 0),
            ('LOTTERY.CONFIRM_TRACK', 'בחרת במסלול {track}, האם זה נכון? הקישי 1 לאישור או 2 לחזרה', 'אישור בחירת מסלול הגרלה', 0),
            ('LOTTERY.NO_EVENT_FOUND', 'לא נמצא אירוע זמין לכניסה להגרלה', 'הודעה כשלא נמצא אירוע להגרלה', 0),
            ('LOTTERY.ENTRY_SUCCESS', 'נכנסת בהצלחה למסלול הגרלה {track}', 'הודעת הצלחה לכניסה להגרלה', 0),
            ('LOTTERY.GOODBYE', 'תודה רבה וביי ביי', 'הודעת סיום לכניסה להגרלה', 0),
            ('GENERAL.MAIN_MENU', 'לדיווח אירוע הקישי 1, לאחר השמחה הקישי 2, לכניסה להגרלה הקישי 3', 'תפריט ראשי מעודכן עם אפשרות הגרלה', 0)
            ON DUPLICATE KEY UPDATE value = VALUES(value), description = VALUES(description);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove lottery-related texts
        await queryRunner.query(`
            DELETE FROM texts WHERE name IN (
                'LOTTERY.WELCOME',
                'LOTTERY.TRACK_SELECTION', 
                'LOTTERY.INVALID_TRACK',
                'LOTTERY.CONFIRM_TRACK',
                'LOTTERY.NO_EVENT_FOUND',
                'LOTTERY.ENTRY_SUCCESS',
                'LOTTERY.GOODBYE'
            );
        `);
        
        // Restore original main menu text
        await queryRunner.query(`
            UPDATE texts SET value = 'לדיווח אירוע הקישי 1, לאחר השמחה הקישי 2' 
            WHERE name = 'GENERAL.MAIN_MENU';
        `);
    }

}
