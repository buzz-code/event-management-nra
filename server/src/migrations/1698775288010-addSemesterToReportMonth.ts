import { MigrationInterface, QueryRunner } from "typeorm";

export class addSemesterToReportMonth1698775288010 implements MigrationInterface {
    name = 'addSemesterToReportMonth1698775288010'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`report_month\`
            ADD \`semester\` varchar(255) NOT NULL DEFAULT 'שנתי'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`report_month\` DROP COLUMN \`semester\`
        `);
    }

}
