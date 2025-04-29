import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserPaymentInfo1684693416581 implements MigrationInterface {
    name = 'addUserPaymentInfo1684693416581'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`isPaid\` tinyint NOT NULL DEFAULT 0
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`paymentMethod\` varchar(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`paymentMethod\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`isPaid\`
        `);
    }

}
