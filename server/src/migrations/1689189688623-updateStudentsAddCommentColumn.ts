import { MigrationInterface, QueryRunner } from "typeorm";

export class updateStudentsAddCommentColumn1689189688623 implements MigrationInterface {
    name = 'updateStudentsAddCommentColumn1689189688623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`comment\` varchar(1000) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`comment\`
        `);
    }

}
