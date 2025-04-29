import { MigrationInterface, QueryRunner } from "typeorm";

export class addTeacherGradeReportFileViews1705432003726 implements MigrationInterface {
    name = 'addTeacherGradeReportFileViews1705432003726'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE VIEW \`grade_with_report_month\` AS
            SELECT \`report_months\`.\`id\` AS \`reportMonthReferenceId\`,
                grades.*
            FROM \`grades\` \`grades\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`grades\`.\`user_id\` = \`report_months\`.\`userId\`
                AND \`grades\`.\`report_date\` <= \`report_months\`.\`endDate\`
                AND \`grades\`.\`report_date\` >= \`report_months\`.\`startDate\`
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
        `, ["meir_att_copy_ra","VIEW","grade_with_report_month","SELECT `report_months`.`id` AS `reportMonthReferenceId`, grades.* FROM `grades` `grades` LEFT JOIN `report_month` `report_months` ON `grades`.`user_id` = `report_months`.`userId` AND `grades`.`report_date` <= `report_months`.`endDate` AND `grades`.`report_date` >= `report_months`.`startDate`"]);
        await queryRunner.query(`
            CREATE VIEW \`teacher_lesson_grade_report_status\` AS
            SELECT \`teachers\`.\`id\` AS \`teacherId\`,
                \`lessons\`.\`id\` AS \`lessonId\`,
                \`lessons\`.\`year\` AS \`year\`,
                \`lessons\`.\`name\` AS \`lessonName\`,
                \`report_months\`.\`id\` AS \`reportMonthId\`,
                \`teachers\`.\`user_id\` AS \`userId\`,
                CASE
                    WHEN COUNT(\`grades\`.\`id\`) > 0 THEN 1
                    ELSE 0
                END AS \`isReported\`
            FROM \`teachers\` \`teachers\`
                INNER JOIN \`lessons\` \`lessons\` ON \`lessons\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                LEFT JOIN \`report_month\` \`report_months\` ON \`report_months\`.\`userId\` = \`teachers\`.\`user_id\`
                LEFT JOIN \`grade_with_report_month\` \`grades\` ON \`grades\`.\`teacherReferenceId\` = \`teachers\`.\`id\`
                AND \`grades\`.\`lessonReferenceId\` = \`lessons\`.\`id\`
                AND \`grades\`.\`reportMonthReferenceId\` = \`report_months\`.\`id\`
            WHERE COALESCE(
                    \`lessons\`.\`start_date\`,
                    \`report_months\`.\`endDate\`
                ) <= \`report_months\`.\`endDate\`
                AND COALESCE(
                    \`lessons\`.\`end_date\`,
                    \`report_months\`.\`startDate\`
                ) >= \`report_months\`.\`startDate\`
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
        `, ["meir_att_copy_ra","VIEW","teacher_lesson_grade_report_status","SELECT `teachers`.`id` AS `teacherId`, `lessons`.`id` AS `lessonId`, `lessons`.`year` AS `year`, `lessons`.`name` AS `lessonName`, `report_months`.`id` AS `reportMonthId`, `teachers`.`user_id` AS `userId`, CASE WHEN COUNT(`grades`.`id`) > 0 THEN 1 ELSE 0 END AS `isReported` FROM `teachers` `teachers` INNER JOIN `lessons` `lessons` ON `lessons`.`teacherReferenceId` = `teachers`.`id`  LEFT JOIN `report_month` `report_months` ON `report_months`.`userId` = `teachers`.`user_id`  LEFT JOIN `grade_with_report_month` `grades` ON `grades`.`teacherReferenceId` = `teachers`.`id` AND `grades`.`lessonReferenceId` = `lessons`.`id` AND `grades`.`reportMonthReferenceId` = `report_months`.`id` WHERE COALESCE(`lessons`.`start_date`, `report_months`.`endDate`) <= `report_months`.`endDate` AND COALESCE(`lessons`.`end_date`, `report_months`.`startDate`) >= `report_months`.`startDate` GROUP BY `teachers`.`id`, `lessons`.`id`, `report_months`.`id` ORDER BY `report_months`.`id` ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`teacher_grade_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`year\` AS \`year\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
                \`teacher\`.\`name\` AS \`teacherName\`,
                \`rm\`.\`name\` AS \`reportMonthName\`,
                CONCAT(
                    COALESCE(\`tlrs\`.\`userId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`teacherId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`reportMonthId\`, "null"),
                    "_",
                    COALESCE(\`tlrs\`.\`year\`, "null")
                ) AS \`id\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\`
                ) AS \`reportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonId\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\`
                ) AS \`notReportedLessons\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 1 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ", "
                ) AS \`reportedLessonNames\`,
                GROUP_CONCAT(
                    DISTINCT CASE
                        WHEN \`tlrs\`.\`isReported\` = 0 THEN \`tlrs\`.\`lessonName\`
                    END
                    ORDER BY \`tlrs\`.\`lessonName\` SEPARATOR ", "
                ) AS \`notReportedLessonNames\`
            FROM \`teacher_lesson_grade_report_status\` \`tlrs\`
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
        `, ["meir_att_copy_ra","VIEW","teacher_grade_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `rm`.`name` AS `reportMonthName`, CONCAT(COALESCE(`tlrs`.`userId`, \"null\"), \"_\", COALESCE(`tlrs`.`teacherId`, \"null\"), \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\"), \"_\", COALESCE(`tlrs`.`year`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `notReportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `reportedLessonNames`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `notReportedLessonNames` FROM `teacher_lesson_grade_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId`, `tlrs`.`year` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_grade_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_grade_report_status\`
        `);
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","teacher_lesson_grade_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_lesson_grade_report_status\`
        `);
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","grade_with_report_month","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`grade_with_report_month\`
        `);
    }

}
