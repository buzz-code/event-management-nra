import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserBccAddress1706608882654 implements MigrationInterface {
    name = 'addUserBccAddress1706608882654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`bccAddress\` varchar(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`bccAddress\`
        `);
    }

}
