import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserInfoColumn1682255853138 implements MigrationInterface {
    name = 'addUserInfoColumn1682255853138'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`userInfo\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`userInfo\`
        `);
    }

}
