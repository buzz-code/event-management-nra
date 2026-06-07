import { MigrationInterface, QueryRunner } from "typeorm";

export class addEventStudentUserDateIndex1780859183610 implements MigrationInterface {
    name = 'addEventStudentUserDateIndex1780859183610'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX \`events_student_user_date_idx\` ON \`events\` (
                \`studentReferenceId\`,
                \`user_id\`,
                \`eventDate\`,
                \`id\`
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`events_student_user_date_idx\` ON \`events\`
        `);
    }

}
