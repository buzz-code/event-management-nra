import { MigrationInterface, QueryRunner } from "typeorm";

export class addStudentByYearView1693688366912 implements MigrationInterface {
    name = 'addStudentByYearView1693688366912'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE VIEW \`student_by_year\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
                \`students\`.\`id\` AS \`id\`,
                \`students\`.\`tz\` AS \`tz\`,
                \`students\`.\`name\` AS \`name\`,
                \`students\`.\`user_id\` AS \`user_id\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`students\` \`students\` ON \`students\`.\`id\` = \`student_klasses\`.\`studentReferenceId\`
            GROUP BY \`students\`.\`id\`,
                \`student_klasses\`.\`year\`
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
        `, ["meir_att_copy_ra","VIEW","student_by_year","SELECT `student_klasses`.`year` AS `year`, `students`.`id` AS `id`, `students`.`tz` AS `tz`, `students`.`name` AS `name`, `students`.`user_id` AS `user_id` FROM `student_klasses` `student_klasses` LEFT JOIN `students` `students` ON `students`.`id` = `student_klasses`.`studentReferenceId` GROUP BY `students`.`id`, `student_klasses`.`year`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_by_year","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_by_year\`
        `);
    }

}
