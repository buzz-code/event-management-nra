import { MigrationInterface, QueryRunner } from "typeorm";

export class addYearToReportMonth1727203045203 implements MigrationInterface {
    name = 'addYearToReportMonth1727203045203'

    public async up(queryRunner: QueryRunner): Promise<void> {
        try {
            await queryRunner.query(`
                ALTER TABLE \`report_month\`
                ADD \`year\` int NULL
            `);
            await queryRunner.query(`
                CREATE INDEX \`report_month_user_id_start_date_end_date_year_idx\` ON \`report_month\` (\`userId\`, \`startDate\`, \`endDate\`, \`year\`)
            `);
            await queryRunner.query(`
                CREATE INDEX \`report_month_user_id_year_idx\` ON \`report_month\` (\`userId\`, \`year\`)
            `);
        } catch (e) {
            console.log('error while running migration', e)
        }

        await queryRunner.query(`
            UPDATE \`report_month\`
            SET \`year\` = 5782
            WHERE \`year\` is null AND endDate < '2022-09-01'
        `);
        await queryRunner.query(`
            UPDATE \`report_month\`
            SET \`year\` = 5783
            WHERE \`year\` is null AND endDate < '2023-09-01'
        `);
        await queryRunner.query(`
            UPDATE \`report_month\`
            SET \`year\` = 5784
            WHERE \`year\` is null AND endDate < '2024-09-01'
        `);
        await queryRunner.query(`
            UPDATE \`report_month\`
            SET \`year\` = 5785
            WHERE \`year\` is null AND endDate < '2025-09-01'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`report_month_user_id_year_idx\` ON \`report_month\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_month_user_id_start_date_end_date_year_idx\` ON \`report_month\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`report_month\` DROP COLUMN \`year\`
        `);
    }

}
