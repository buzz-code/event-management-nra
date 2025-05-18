import { Text } from "@shared/entities/Text.entity";
import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateYemotTexts1747596563719 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`texts\` WHERE 1 = 1;
        `);

        const textRepo = queryRunner.manager.getRepository(Text);
        const texts = [
            { name: 'STUDENT.TZ_PROMPT', text: 'הקישי מספר תעודת זהות' },
            { name: 'STUDENT.NOT_FOUND', text: 'לא נמצאה תלמידה עם תעודת זהות זו' },
            { name: 'GENERAL.WELCOME', text: 'שלום, {name}, ברוכה הבאה למערכת השמחות' },
            { name: 'GENERAL.INVALID_INPUT', text: 'הנתון שהקשת לא תקין' },
            { name: 'GENERAL.YES', text: 'לאישור הקישי 1' },
            { name: 'GENERAL.NO', text: 'לשינוי הקישי 2' },
            { name: 'EVENT.TYPE_SELECTION', text: 'נא לבחור סוג אירוע {options}' },
            { name: 'EVENT.GIFT_SELECTION', text: 'נא לבחור מתנה {options}' },
            { name: 'DATE.DAY_SELECTION', text: 'נא להזין תאריך' },
            { name: 'DATE.MONTH_SELECTION', text: 'נא להזין חודש {options}' },
            { name: 'DATE.CONFIRM_DATE', text: 'נא לאשר תאריך {date} {yes} {no}' },
            { name: 'EVENT.SAVE_SUCCESS', text: 'האירוע נשמר בהצלחה' },
        ];
        await textRepo.save(texts.map(text => ({
            name: text.name,
            value: text.text,
            description: text.text,
            userId: 0,
        })));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
