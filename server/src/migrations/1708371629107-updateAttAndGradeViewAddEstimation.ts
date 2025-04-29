import { MigrationInterface, QueryRunner } from "typeorm";

export class updateAttAndGradeViewAddEstimation1708371629107 implements MigrationInterface {
    name = 'updateAttAndGradeViewAddEstimation1708371629107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_and_grade","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`att_report_and_grade\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`att_report_and_grade\` AS
            SELECT CONCAT('a-', id) AS id,
                'att' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                abs_count,
                approved_abs_count,
                NULL AS 'grade',
                NULL AS 'estimation',
                comments,
                sheet_name
            FROM att_reports
            UNION
            SELECT CONCAT('g-', id) AS id,
                'grade' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                NULL AS 'abs_count',
                NULL AS 'approved_abs_count',
                grade,
                estimation,
                comments,
                NULL AS 'sheet_name'
            FROM grades
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
        `, ["meir_att_copy_ra","VIEW","att_report_and_grade","SELECT\n      CONCAT('a-', id) AS id,\n      'att' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      abs_count,\n      approved_abs_count,\n      NULL AS 'grade',\n      NULL AS 'estimation',\n      comments,\n      sheet_name\n  FROM\n      att_reports\n  UNION\n  SELECT\n      CONCAT('g-', id) AS id,\n      'grade' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      NULL AS 'abs_count',\n      NULL AS 'approved_abs_count',\n      grade,\n      estimation,\n      comments,\n      NULL AS 'sheet_name'\n  FROM\n      grades"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","att_report_and_grade","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`att_report_and_grade\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`att_report_and_grade\` AS
            SELECT CONCAT('a-', id) AS id,
                'att' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                abs_count,
                approved_abs_count,
                NULL AS 'grade',
                comments,
                sheet_name
            FROM att_reports
            UNION
            SELECT CONCAT('g-', id) AS id,
                'grade' as 'type',
                user_id,
                \`year\`,
                studentReferenceId,
                teacherReferenceId,
                lessonReferenceId,
                klassReferenceId,
                report_date,
                how_many_lessons,
                NULL AS 'abs_count',
                NULL AS 'approved_abs_count',
                grade,
                comments,
                NULL AS 'sheet_name'
            FROM grades
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
        `, ["meir_att_copy_ra","VIEW","att_report_and_grade","SELECT\n      CONCAT('a-', id) AS id,\n      'att' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      abs_count,\n      approved_abs_count,\n      NULL AS 'grade',\n      comments,\n      sheet_name\n  FROM\n      att_reports\n  UNION\n  SELECT\n      CONCAT('g-', id) AS id,\n      'grade' as 'type',\n      user_id,\n      `year`,\n      studentReferenceId,\n      teacherReferenceId,\n      lessonReferenceId,\n      klassReferenceId,\n      report_date,\n      how_many_lessons,\n      NULL AS 'abs_count',\n      NULL AS 'approved_abs_count',\n      grade,\n      comments,\n      NULL AS 'sheet_name'\n  FROM\n      grades"]);
    }

}
