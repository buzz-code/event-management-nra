import { MigrationInterface, QueryRunner } from "typeorm";

export class updateViewsIdsAgain1696875184214 implements MigrationInterface {
    name = 'updateViewsIdsAgain1696875184214'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_salary_report","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_salary_report\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`teacher_salary_report\` AS
            SELECT DISTINCT \`att_reports\`.\`year\` AS \`year\`,
                \`att_reports\`.\`teacherReferenceId\` AS \`teacherReferenceId\`,
                \`att_reports\`.\`klassReferenceId\` AS \`klassReferenceId\`,
                \`att_reports\`.\`lessonReferenceId\` AS \`lessonReferenceId\`,
                \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                CONCAT(
                    COALESCE(\`att_reports\`.\`user_id\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`teacherReferenceId\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`lessonReferenceId\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`klassReferenceId\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`how_many_lessons\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`year\`, "null"),
                    "_",
                    COALESCE(\`report_months\`.\`id\`, "null")
                ) AS \`id\`,
                \`att_reports\`.\`user_id\` AS \`userId\`,
                \`att_reports\`.\`how_many_lessons\` AS \`how_many_lessons\`
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
        `, ["meir_att_copy_ra","VIEW","teacher_salary_report","SELECT DISTINCT `att_reports`.`year` AS `year`, `att_reports`.`teacherReferenceId` AS `teacherReferenceId`, `att_reports`.`klassReferenceId` AS `klassReferenceId`, `att_reports`.`lessonReferenceId` AS `lessonReferenceId`, `report_months`.`id` AS `reportMonthReferenceId`, CONCAT(COALESCE(`att_reports`.`user_id`, \"null\"), \"_\", COALESCE(`att_reports`.`teacherReferenceId`, \"null\"), \"_\", COALESCE(`att_reports`.`lessonReferenceId`, \"null\"), \"_\", COALESCE(`att_reports`.`klassReferenceId`, \"null\"), \"_\", COALESCE(`att_reports`.`how_many_lessons`, \"null\"), \"_\", COALESCE(`att_reports`.`year`, \"null\"), \"_\", COALESCE(`report_months`.`id`, \"null\")) AS `id`, `att_reports`.`user_id` AS `userId`, `att_reports`.`how_many_lessons` AS `how_many_lessons` FROM `att_reports` `att_reports` LEFT JOIN `report_month` `report_months` ON `att_reports`.`user_id` = `report_months`.`userId` AND `att_reports`.`report_date` <= `report_months`.`endDate` AND `att_reports`.`report_date` >= `report_months`.`startDate`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_salary_report","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_salary_report\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`teacher_salary_report\` AS
            SELECT DISTINCT \`att_reports\`.\`year\` AS \`year\`,
                \`att_reports\`.\`teacherReferenceId\` AS \`teacherReferenceId\`,
                \`att_reports\`.\`klassReferenceId\` AS \`klassReferenceId\`,
                \`att_reports\`.\`lessonReferenceId\` AS \`lessonReferenceId\`,
                \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                CONCAT(
                    COALESCE(\`att_reports\`.\`user_id\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`teacherReferenceId\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`lessonReferenceId\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`klassReferenceId\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`how_many_lessons\`, "null"),
                    "_",
                    COALESCE(\`att_reports\`.\`year\`, "null")
                ),
                "_",
                COALESCE(\`report_months\`.\`id\`, "null") AS \`id\`,
                \`att_reports\`.\`user_id\` AS \`userId\`,
                \`att_reports\`.\`how_many_lessons\` AS \`how_many_lessons\`
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
        `, ["meir_att_copy_ra","VIEW","teacher_salary_report","SELECT DISTINCT `att_reports`.`year` AS `year`, `att_reports`.`teacherReferenceId` AS `teacherReferenceId`, `att_reports`.`klassReferenceId` AS `klassReferenceId`, `att_reports`.`lessonReferenceId` AS `lessonReferenceId`, `report_months`.`id` AS `reportMonthReferenceId`, CONCAT(COALESCE(`att_reports`.`user_id`, \"null\"), \"_\", COALESCE(`att_reports`.`teacherReferenceId`, \"null\"), \"_\", COALESCE(`att_reports`.`lessonReferenceId`, \"null\"), \"_\", COALESCE(`att_reports`.`klassReferenceId`, \"null\"), \"_\", COALESCE(`att_reports`.`how_many_lessons`, \"null\"), \"_\", COALESCE(`att_reports`.`year`, \"null\")), \"_\", COALESCE(`report_months`.`id`, \"null\") AS `id`, `att_reports`.`user_id` AS `userId`, `att_reports`.`how_many_lessons` AS `how_many_lessons` FROM `att_reports` `att_reports` LEFT JOIN `report_month` `report_months` ON `att_reports`.`user_id` = `report_months`.`userId` AND `att_reports`.`report_date` <= `report_months`.`endDate` AND `att_reports`.`report_date` >= `report_months`.`startDate`"]);
    }

}
