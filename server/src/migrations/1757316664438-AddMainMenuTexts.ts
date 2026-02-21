import { MigrationInterface, QueryRunner } from "typeorm"

export class AddMainMenuTexts1757316664438 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const texts = [
            { name: 'GENERAL.MAIN_MENU', text: 'לדיווח אירוע חדש הקישי 1, לבירור הזמנת מתנות הקישי 2' },
            { name: 'EVENT.FULFILLMENT_UNAVAILABLE', text: 'אפשרות בירור הזמנת מתנות אינה זמינה כרגע. אנא פנה למנהל המערכת.' },
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
            `DELETE FROM \`texts\` WHERE \`name\` IN (?, ?)`,
            ['GENERAL.MAIN_MENU', 'EVENT.FULFILLMENT_UNAVAILABLE'],
        );
    }

}
