import { MigrationInterface, QueryRunner } from "typeorm";

export class createAttReportWithReportMonthView1698309566758 implements MigrationInterface {
    name = 'createAttReportWithReportMonthView1698309566758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE VIEW \`att_report_with_report_month\` AS
            SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                att_reports.*
            FROM \`att_reports\` \`att_reports\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`att_reports\`.\`user_id\` = \`report_months\`.\`userId\`
                AND \`att_reports\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`att_reports\`.\`report_date\` >= \`report_months\`.\`startDate\`
        `);
        await queryRunner.query(`
            INSERT INTO \`meir_att_copy_ra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["meir_att_copy_ra","VIEW","att_report_with_report_month","SELECT `report_months`.`id` AS `reportMonthReferenceId`, att_reports.* FROM `att_reports` `att_reports` LEFT JOIN `report_month` `report_months` ON `att_reports`.`user_id` = `report_months`.`userId` AND `att_reports`.`report_date` <= `report_months`.`endDate` AND `att_reports`.`report_date` >= `report_months`.`startDate`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_with_report_month","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`att_report_with_report_month\`
        `);
    }

}
