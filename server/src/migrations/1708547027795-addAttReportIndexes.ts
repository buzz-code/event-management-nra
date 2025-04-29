import { MigrationInterface, QueryRunner } from "typeorm";

export class addAttReportIndexes1708547027795 implements MigrationInterface {
    name = 'addAttReportIndexes1708547027795'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX \`att_user_year_lesson_reference_id_idx\` ON \`att_reports\` (\`user_id\`, \`lessonReferenceId\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_user_year_teacher_reference_id_idx\` ON \`att_reports\` (\`user_id\`, \`teacherReferenceId\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_user_year_student_reference_id_idx\` ON \`att_reports\` (\`user_id\`, \`studentReferenceId\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_user_year_idx\` ON \`att_reports\` (\`user_id\`, \`year\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`att_user_year_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_user_year_student_reference_id_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_user_year_teacher_reference_id_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_user_year_lesson_reference_id_idx\` ON \`att_reports\`
        `);
    }

}
