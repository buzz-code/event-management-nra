import { MigrationInterface, QueryRunner } from "typeorm";

export class addYearToTeacherStatusReports1687115195304 implements MigrationInterface {
    name = 'addYearToTeacherStatusReports1687115195304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_report_status\`
        `);
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_lesson_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_lesson_report_status\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`teacher_lesson_report_status\` AS
            SELECT \`teachers\`.\`id\` AS \`teacherId\`,
                \`lessons\`.\`id\` AS \`lessonId\`,
                \`lessons\`.\`year\` AS \`year\`,
                \`report_months\`.\`id\` AS \`reportMonthId\`,
                \`teachers\`.\`user_id\` AS \`userId\`,
                CASE
                    WHEN COUNT(\`att_reports\`.\`id\`) > 0 THEN 1
                    ELSE 0
                END AS \`isReported\`
            FROM \`teachers\` \`teachers\`
                INNER JOIN \`lessons\` \`lessons\` ON \`lessons\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`report_months\`.\`userId\` = \`teachers\`.\`user_id\`
                LEFT JOIN \`att_reports\` \`att_reports\` ON \`att_reports\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                AND \`att_reports\`.\`lessonReferenceId\` = \`lessons\`.\`id\`
                AND \`att_reports\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`att_reports\`.\`report_date\` >= \`report_months\`.\`startDate\`
            GROUP BY \`teachers\`.\`id\`,
                \`lessons\`.\`id\`,
                \`report_months\`.\`id\`
            ORDER BY \`report_months\`.\`id\` ASC
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
        `, ["meir_att_copy_ra","VIEW","teacher_lesson_report_status","SELECT `teachers`.`id` AS `teacherId`, `lessons`.`id` AS `lessonId`, `lessons`.`year` AS `year`, `report_months`.`id` AS `reportMonthId`, `teachers`.`user_id` AS `userId`, CASE WHEN COUNT(`att_reports`.`id`) > 0 THEN 1 ELSE 0 END AS `isReported` FROM `teachers` `teachers` INNER JOIN `lessons` `lessons` ON `lessons`.`teacherReferenceId` = `teachers`.`id`  LEFT JOIN `report_month` `report_months` ON `report_months`.`userId` = `teachers`.`user_id`  LEFT JOIN `att_reports` `att_reports` ON `att_reports`.`teacherReferenceId` = `teachers`.`id` AND `att_reports`.`lessonReferenceId` = `lessons`.`id` AND `att_reports`.`report_date` <= `report_months`.`endDate` AND `att_reports`.`report_date` >= `report_months`.`startDate` GROUP BY `teachers`.`id`, `lessons`.`id`, `report_months`.`id` ORDER BY `report_months`.`id` ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`teacher_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`year\` AS \`year\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
                \`teacher\`.\`name\` AS \`teacherName\`,
                \`rm\`.\`name\` AS \`reportMonthName\`,
                CONCAT(
                    \`tlrs\`.\`userId\`,
                    "_",
                    \`tlrs\`.\`teacherId\`,
                    "_",
                    COALESCE(\`tlrs\`.\`reportMonthId\`, "null")
                ) AS \`id\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonId\`
                ) AS \`reportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonId\`
                ) AS \`notReportedLessons\`
            FROM \`teacher_lesson_report_status\` \`tlrs\`
                LEFT JOIN \`teachers\` \`teacher\` ON \`tlrs\`.\`teacherId\` = \`teacher\`.\`id\`
                LEFT JOIN \`report_month\` \`rm\` ON \`tlrs\`.\`reportMonthId\` = \`rm\`.\`id\`
            GROUP BY \`tlrs\`.\`userId\`,
                \`tlrs\`.\`teacherId\`,
                \`tlrs\`.\`reportMonthId\`,
                \`tlrs\`.\`year\`
            ORDER BY \`tlrs\`.\`reportMonthId\` ASC,
                \`tlrs\`.\`teacherId\` ASC
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
        `, ["meir_att_copy_ra","VIEW","teacher_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `rm`.`name` AS `reportMonthName`, CONCAT(`tlrs`.`userId`, \"_\", `tlrs`.`teacherId`, \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonId`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonId`) AS `notReportedLessons` FROM `teacher_lesson_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId`, `tlrs`.`year` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_report_status\`
        `);
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_lesson_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_lesson_report_status\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`teacher_lesson_report_status\` AS
            SELECT \`teachers\`.\`id\` AS \`teacherId\`,
                \`lessons\`.\`id\` AS \`lessonId\`,
                \`report_months\`.\`id\` AS \`reportMonthId\`,
                \`teachers\`.\`user_id\` AS \`userId\`,
                CASE
                    WHEN COUNT(\`att_reports\`.\`id\`) > 0 THEN 1
                    ELSE 0
                END AS \`isReported\`
            FROM \`teachers\` \`teachers\`
                INNER JOIN \`lessons\` \`lessons\` ON \`lessons\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`report_months\`.\`userId\` = \`teachers\`.\`user_id\`
                LEFT JOIN \`att_reports\` \`att_reports\` ON \`att_reports\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                AND \`att_reports\`.\`lessonReferenceId\` = \`lessons\`.\`id\`
                AND \`att_reports\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`att_reports\`.\`report_date\` >= \`report_months\`.\`startDate\`
            GROUP BY \`teachers\`.\`id\`,
                \`lessons\`.\`id\`,
                \`report_months\`.\`id\`
            ORDER BY \`report_months\`.\`id\` ASC
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
        `, ["meir_att_copy_ra","VIEW","teacher_lesson_report_status","SELECT `teachers`.`id` AS `teacherId`, `lessons`.`id` AS `lessonId`, `report_months`.`id` AS `reportMonthId`, `teachers`.`user_id` AS `userId`, CASE WHEN COUNT(`att_reports`.`id`) > 0 THEN 1 ELSE 0 END AS `isReported` FROM `teachers` `teachers` INNER JOIN `lessons` `lessons` ON `lessons`.`teacherReferenceId` = `teachers`.`id`  LEFT JOIN `report_month` `report_months` ON `report_months`.`userId` = `teachers`.`user_id`  LEFT JOIN `att_reports` `att_reports` ON `att_reports`.`teacherReferenceId` = `teachers`.`id` AND `att_reports`.`lessonReferenceId` = `lessons`.`id` AND `att_reports`.`report_date` <= `report_months`.`endDate` AND `att_reports`.`report_date` >= `report_months`.`startDate` GROUP BY `teachers`.`id`, `lessons`.`id`, `report_months`.`id` ORDER BY `report_months`.`id` ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`teacher_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
                \`teacher\`.\`name\` AS \`teacherName\`,
                \`rm\`.\`name\` AS \`reportMonthName\`,
                CONCAT(
                    \`tlrs\`.\`userId\`,
                    "_",
                    \`tlrs\`.\`teacherId\`,
                    "_",
                    COALESCE(\`tlrs\`.\`reportMonthId\`, "null")
                ) AS \`id\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonId\`
                ) AS \`reportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonId\`
                ) AS \`notReportedLessons\`
            FROM \`teacher_lesson_report_status\` \`tlrs\`
                LEFT JOIN \`teachers\` \`teacher\` ON \`tlrs\`.\`teacherId\` = \`teacher\`.\`id\`
                LEFT JOIN \`report_month\` \`rm\` ON \`tlrs\`.\`reportMonthId\` = \`rm\`.\`id\`
            GROUP BY \`tlrs\`.\`userId\`,
                \`tlrs\`.\`teacherId\`,
                \`tlrs\`.\`reportMonthId\`
            ORDER BY \`tlrs\`.\`reportMonthId\` ASC,
                \`tlrs\`.\`teacherId\` ASC
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
        `, ["meir_att_copy_ra","VIEW","teacher_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `rm`.`name` AS `reportMonthName`, CONCAT(`tlrs`.`userId`, \"_\", `tlrs`.`teacherId`, \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonId`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonId`) AS `notReportedLessons` FROM `teacher_lesson_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
    }

}
