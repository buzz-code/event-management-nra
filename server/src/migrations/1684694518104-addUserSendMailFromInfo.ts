import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserSendMailFromInfo1684694518104 implements MigrationInterface {
    name = 'addUserSendMailFromInfo1684694518104'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`mailAddressAlias\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`mailAddressTitle\` varchar(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`mailAddressTitle\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`mailAddressAlias\`
        `);
    }

}
