import { MigrationInterface, QueryRunner } from "typeorm"

export class AddEventTypeConfirmText1747637090289 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const texts = [
            { name: 'EVENT.CONFIRM_TYPE', text: 'בחרת באירוע {name}, לאישור {yes} לשינוי {no}' },
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
            `DELETE FROM \`texts\` WHERE \`name\` IN (?)`,
            ['EVENT.CONFIRM_TYPE'],
        );
    }

}
