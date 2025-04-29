import { MigrationInterface, QueryRunner } from "typeorm";

export class addStudentGlobalReportView1686757929196 implements MigrationInterface {
    name = 'addStudentGlobalReportView1686757929196'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE VIEW \`student_global_report\` AS
            SELECT user_id,
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
        `, ["meir_att_copy_ra","VIEW","student_global_report","SELECT user_id, year, studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, SUM(how_many_lessons) AS `lessons_count`, SUM(abs_count) AS `abs_count`, AVG(grade) AS `grade_avg` FROM `att_report_and_grade` `atag` GROUP BY studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, user_id, year"]);
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
    }

}
