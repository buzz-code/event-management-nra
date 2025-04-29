import { MigrationInterface, QueryRunner } from "typeorm";

export class addCommentToLessons1694374542167 implements MigrationInterface {
    name = 'addCommentToLessons1694374542167'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lessons\`
            ADD \`comment\` varchar(1000) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lessons\` DROP COLUMN \`comment\`
        `);
    }

}
