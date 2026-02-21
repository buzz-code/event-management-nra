import { MigrationInterface, QueryRunner } from "typeorm"

export class AddMultiGiftTexts1747600768956 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const texts = [
            { name: 'EVENT.ADDITIONAL_GIFT_SELECTION', text: 'נא לבחור מתנה נוספת {options}' },
            { name: 'EVENT.SELECT_ANOTHER_GIFT', text: 'האם ברצונך לבחור מתנה נוספת? {yes} {no}' },
            { name: 'EVENT.CONFIRM_GIFTS', text: 'המתנות שבחרת הן: {gifts}, סה״כ {count} מתנות, לאישור {yes} לשינוי {no}' },
            { name: 'EVENT.GIFTS_ADDED', text: 'נוספו {count} מתנות בהצלחה' },
        ];

        for (const text of texts) {
            await queryRunner.query(
                'INSERT INTO `texts` (`user_id`, `name`, `description`, `value`) VALUES (?, ?, ?, ?)',
                [0, text.name, text.text, text.text],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM \`texts\` WHERE \`name\` IN (?, ?, ?, ?)`,
            ['EVENT.ADDITIONAL_GIFT_SELECTION', 'EVENT.SELECT_ANOTHER_GIFT', 'EVENT.CONFIRM_GIFTS', 'EVENT.GIFTS_ADDED'],
        );
    }

}
