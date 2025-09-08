import { Text } from "@shared/entities/Text.entity";
import { In, MigrationInterface, QueryRunner } from "typeorm"

export class AddFulfillmentTexts1757364444535 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        const texts = [
            { name: 'FULFILLMENT.START_MESSAGE', text: 'שלום {name}, נתחיל בתהליך בדיקת מימוש האירוע' },
            { name: 'FULFILLMENT.QUESTION_1', text: 'שאלה 1: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_2', text: 'שאלה 2: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_3', text: 'שאלה 3: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_4', text: 'שאלה 4: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_5', text: 'שאלה 5: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_6', text: 'שאלה 6: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_7', text: 'שאלה 7: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_8', text: 'שאלה 8: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_9', text: 'שאלה 9: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_10', text: 'שאלה 10: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.QUESTION_11', text: 'שאלה 11: נא לבחור רמה בין 1 ל-3' },
            { name: 'FULFILLMENT.INVALID_LEVEL', text: 'רמה לא תקינה, נא לבחור בין 1 ל-3' },
            { name: 'FULFILLMENT.DATA_SAVED', text: 'הנתונים נשמרו בהצלחה' },
            { name: 'FULFILLMENT.GOODBYE', text: 'תודה רבה, להתראות' },
        ];

        await textRepo.save(texts.map(text => ({
            name: text.name,
            value: text.text,
            description: text.text,
            userId: 0,
        })));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        await textRepo.delete({
            name: In([
                'FULFILLMENT.START_MESSAGE',
                'FULFILLMENT.QUESTION_1',
                'FULFILLMENT.QUESTION_2',
                'FULFILLMENT.QUESTION_3',
                'FULFILLMENT.QUESTION_4',
                'FULFILLMENT.QUESTION_5',
                'FULFILLMENT.QUESTION_6',
                'FULFILLMENT.QUESTION_7',
                'FULFILLMENT.QUESTION_8',
                'FULFILLMENT.QUESTION_9',
                'FULFILLMENT.QUESTION_10',
                'FULFILLMENT.QUESTION_11',
                'FULFILLMENT.INVALID_LEVEL',
                'FULFILLMENT.DATA_SAVED',
                'FULFILLMENT.GOODBYE'
            ])
        });
    }

}
