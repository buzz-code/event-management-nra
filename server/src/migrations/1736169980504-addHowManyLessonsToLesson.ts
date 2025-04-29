import { MigrationInterface, QueryRunner } from "typeorm";

export class addHowManyLessonsToLesson1736169980504 implements MigrationInterface {
    name = 'addHowManyLessonsToLesson1736169980504'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lessons\`
            ADD \`how_many_lessons\` float NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lessons\` DROP COLUMN \`how_many_lessons\`
        `);
    }

}
