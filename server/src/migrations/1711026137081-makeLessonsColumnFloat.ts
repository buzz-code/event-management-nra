import { MigrationInterface, QueryRunner } from "typeorm";

export class makeLessonsColumnFloat1711026137081 implements MigrationInterface {
    name = 'makeLessonsColumnFloat1711026137081'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`how_many_lessons\` \`how_many_lessons\` float NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`how_many_lessons\` \`how_many_lessons\` float NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`how_many_lessons\` \`how_many_lessons\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`how_many_lessons\` \`how_many_lessons\` int NULL
        `);
    }

}
