import { MigrationInterface, QueryRunner } from "typeorm";

export class addStudentPercentReportView1686766165368 implements MigrationInterface {
    name = 'addStudentPercentReportView1686766165368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE VIEW \`student_percent_report\` AS
            SELECT id,
                user_id,
                year,
                studentReferenceId,
                teacherReferenceId,
                klassReferenceId,
                lessonReferenceId,
                lessons_count,
                abs_count,
                COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1) * 100 AS \`abs_percents\`,
                (
                    1 - COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1)
                ) * 100 AS \`att_percents\`,
                grade_avg
            FROM \`student_global_report\` \`sgr\`
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
        `, ["meir_att_copy_ra","VIEW","student_percent_report","SELECT id, user_id, year, studentReferenceId, teacherReferenceId, klassReferenceId, lessonReferenceId, lessons_count, abs_count, COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1) * 100 AS `abs_percents`, (1 - COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1)) * 100 AS `att_percents`, grade_avg FROM `student_global_report` `sgr`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_percent_report","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_percent_report\`
        `);
    }

}
