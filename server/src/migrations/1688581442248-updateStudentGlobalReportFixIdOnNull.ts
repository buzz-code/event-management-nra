import { MigrationInterface, QueryRunner } from "typeorm";

export class updateStudentGlobalReportFixIdOnNull1688581442248 implements MigrationInterface {
    name = 'updateStudentGlobalReportFixIdOnNull1688581442248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_global_report","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_global_report\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_global_report\` AS
            SELECT CONCAT(
                    COALESCE(studentReferenceId, "null"),
                    "_",
                    COALESCE(teacherReferenceId, "null"),
                    "_",
                    COALESCE(klassReferenceId, "null"),
                    "_",
                    COALESCE(lessonReferenceId, "null")
                ) AS \`id\`,
                user_id,
                year,
                studentReferenceId,
                teacherReferenceId,
                klassReferenceId,
                lessonReferenceId,
                SUM(how_many_lessons) AS \`lessons_count\`,
                SUM(abs_count) AS \`abs_count\`,
                AVG(grade) AS \`grade_avg\`
            FROM \`att_report_and_grade\` \`atag\`
            GROUP BY studentReferenceId,
                teacherReferenceId,
                klassReferenceId,
                lessonReferenceId,
                user_id,
                year
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
        `, ["meir_att_copy_ra","VIEW","student_global_report","SELECT CONCAT(COALESCE(studentReferenceId, \"null\"), \"_\", COALESCE(teacherReferenceId, \"null\"), \"_\", COALESCE(klassReferenceId, \"null\"), \"_\", COALESCE(lessonReferenceId, \"null\")) AS `id`, user_id, year, studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, SUM(how_many_lessons) AS `lessons_count`, SUM(abs_count) AS `abs_count`, AVG(grade) AS `grade_avg` FROM `att_report_and_grade` `atag` GROUP BY studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, user_id, year"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_global_report","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_global_report\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_global_report\` AS
            SELECT CONCAT(
                    studentReferenceId,
                    "_",
                    teacherReferenceId,
                    "_",
                    klassReferenceId,
                    "_",
                    lessonReferenceId
                ) AS \`id\`,
                user_id,
                year,
                studentReferenceId,
                teacherReferenceId,
                klassReferenceId,
                lessonReferenceId,
                SUM(how_many_lessons) AS \`lessons_count\`,
                SUM(abs_count) AS \`abs_count\`,
                AVG(grade) AS \`grade_avg\`
            FROM \`att_report_and_grade\` \`atag\`
            GROUP BY studentReferenceId,
                teacherReferenceId,
                klassReferenceId,
                lessonReferenceId,
                user_id,
                year
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
        `, ["meir_att_copy_ra","VIEW","student_global_report","SELECT CONCAT(studentReferenceId, \"_\", teacherReferenceId, \"_\", klassReferenceId, \"_\", lessonReferenceId) AS `id`, user_id, year, studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, SUM(how_many_lessons) AS `lessons_count`, SUM(abs_count) AS `abs_count`, AVG(grade) AS `grade_avg` FROM `att_report_and_grade` `atag` GROUP BY studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, user_id, year"]);
    }

}
