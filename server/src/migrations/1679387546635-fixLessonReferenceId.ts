import { MigrationInterface, QueryRunner } from "typeorm"

export class fixLessonReferenceId1679387546635 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('att_reports');
        await queryRunner.query(`
        update ${table.name}
            join lessons on (
                lessons.user_id = ${table.name}.user_id AND
                lessons.year = ${table.name}.year AND
                lessons.key = ${table.name}.lesson_id
            )
        set lessonReferenceId = lessons.id
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
