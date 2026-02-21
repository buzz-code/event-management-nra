import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventReportOrigin1771701605424 implements MigrationInterface {
    name = 'AddEventReportOrigin1771701605424'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`reportOrigin\` enum (
                    'only_tatnikit',
                    'only_student',
                    'both_tatnikit_first',
                    'both_student_first'
                ) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`reportOrigin\`
        `);
    }

}
