import { MigrationInterface, QueryRunner } from "typeorm"

export class AddMissingFulfillmentTexts1757365760442 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'INSERT INTO `texts` (`user_id`, `name`, `description`, `value`) VALUES (?, ?, ?, ?)',
            [0, 'FULFILLMENT.NO_EVENT_FOUND', 'לא נמצא אירוע בעבר שטרם בוצע עבורו מילוי', 'לא נמצא אירוע בעבר שטרם בוצע עבורו מילוי'],
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM \`texts\` WHERE \`name\` = ?`,
            ['FULFILLMENT.NO_EVENT_FOUND'],
        );
    }

}
