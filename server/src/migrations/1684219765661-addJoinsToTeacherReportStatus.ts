import { MigrationInterface, QueryRunner } from "typeorm";

export class addJoinsToTeacherReportStatus1684219765661 implements MigrationInterface {
    name = 'addJoinsToTeacherReportStatus1684219765661'

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
            CREATE VIEW \`teacher_report_status\` AS
            SELECT \`tlrs\`.\`userId\` AS \`userId\`,
                \`tlrs\`.\`teacherId\` AS \`teacherId\`,
                \`tlrs\`.\`reportMonthId\` AS \`reportMonthId\`,
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
        `, ["meir_att_copy_ra","VIEW","teacher_report_status","SELECT `tlrs`.`userId` AS `userId`, `tlrs`.`teacherId` AS `teacherId`, `tlrs`.`reportMonthId` AS `reportMonthId`, CONCAT(`tlrs`.`userId`, \"_\", `tlrs`.`teacherId`, \"_\", COALESCE(`tlrs`.`reportMonthId`, \"null\")) AS `id`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 1 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonId`) AS `reportedLessons`, GROUP_CONCAT(DISTINCT CASE WHEN `tlrs`.`isReported` = 0 THEN `tlrs`.`lessonId` END ORDER BY `tlrs`.`lessonId`) AS `notReportedLessons` FROM `teacher_lesson_report_status` `tlrs` GROUP BY `tlrs`.`userId`, `tlrs`.`teacherId`, `tlrs`.`reportMonthId` ORDER BY `tlrs`.`reportMonthId` ASC, `tlrs`.`teacherId` ASC"]);
    }

}
