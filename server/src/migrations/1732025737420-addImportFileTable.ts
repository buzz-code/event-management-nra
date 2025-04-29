import { MigrationInterface, QueryRunner } from "typeorm";

export class addImportFileTable1732025737420 implements MigrationInterface {
    name = 'addImportFileTable1732025737420'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
        `, ["VIEW","teacher_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_report_status\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`comment\` varchar(1000) NULL
        `);
        await queryRunner.query(`
            CREATE VIEW \`teacher_grade_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`year\` AS \`year\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
                \`teacher\`.\`name\` AS \`teacherName\`,
                \`teacher\`.\`comment\` AS \`teacherComment\`,
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
        `, ["meir_att_copy_ra","VIEW","teacher_grade_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `teacher`.`comment` AS `teacherComment`, `rm`.`name` AS `reportMonthName`, CONCAT(COALESCE(`tlrs`.`userId`, \"null\"), \"_\", COALESCE(`tlrs`.`teacherId`, \"null\"), \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\"), \"_\", COALESCE(`tlrs`.`year`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `notReportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `reportedLessonNames`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `notReportedLessonNames` FROM `teacher_lesson_grade_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId`, `tlrs`.`year` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
        await queryRunner.query(`
            CREATE VIEW \`teacher_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`year\` AS \`year\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
                \`teacher\`.\`name\` AS \`teacherName\`,
                \`teacher\`.\`comment\` AS \`teacherComment\`,
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
        `, ["meir_att_copy_ra","VIEW","teacher_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `teacher`.`comment` AS `teacherComment`, `rm`.`name` AS `reportMonthName`, CONCAT(COALESCE(`tlrs`.`userId`, \"null\"), \"_\", COALESCE(`tlrs`.`teacherId`, \"null\"), \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\"), \"_\", COALESCE(`tlrs`.`year`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `notReportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `reportedLessonNames`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `notReportedLessonNames` FROM `teacher_lesson_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId`, `tlrs`.`year` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
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
        `, ["VIEW","teacher_grade_report_status","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`teacher_grade_report_status\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`comment\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`teacher_report_status\` AS
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
        `, ["meir_att_copy_ra","VIEW","teacher_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`year` AS `year`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, `teacher`.`name` AS `teacherName`, `rm`.`name` AS `reportMonthName`, CONCAT(COALESCE(`tlrs`.`userId`, \"null\"), \"_\", COALESCE(`tlrs`.`teacherId`, \"null\"), \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\"), \"_\", COALESCE(`tlrs`.`year`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonName`) AS `notReportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `reportedLessonNames`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonName` END ORDER BY `tlrs`.`lessonName` SEPARATOR \", \") AS `notReportedLessonNames` FROM `teacher_lesson_report_status` `tlrs` LEFT JOIN `teachers` `teacher` ON `tlrs`.`teacherId` = `teacher`.`id`  LEFT JOIN `report_month` `rm` ON `tlrs`.`reportMonthId` = `rm`.`id` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId`, `tlrs`.`year` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
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

}
