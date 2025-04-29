import { MigrationInterface, QueryRunner } from "typeorm";

export class addDisplayNameToLessonAndKlass1742452916412 implements MigrationInterface {
    name = 'addDisplayNameToLessonAndKlass1742452916412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klasses\`
            ADD \`display_name\` varchar(500) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`lessons\`
            ADD \`display_name\` varchar(500) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lessons\` DROP COLUMN \`display_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\` DROP COLUMN \`display_name\`
        `);
    }

}
