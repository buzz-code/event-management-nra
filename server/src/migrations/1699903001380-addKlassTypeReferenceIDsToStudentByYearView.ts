import { MigrationInterface, QueryRunner } from "typeorm";

export class addKlassTypeReferenceIDsToStudentByYearView1699903001380 implements MigrationInterface {
    name = 'addKlassTypeReferenceIDsToStudentByYearView1699903001380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_by_year","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_by_year\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_by_year\` AS
            SELECT \`students\`.\`id\` AS \`id\`,
                \`students\`.\`tz\` AS \`tz\`,
                \`students\`.\`name\` AS \`name\`,
                \`students\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`student_klasses\`.\`year\`) AS \`year\`,
                GROUP_CONCAT(DISTINCT \`student_klasses\`.\`klassReferenceId\`) AS \`klassReferenceIds\`,
                GROUP_CONCAT(DISTINCT \`klasses\`.\`klassTypeReferenceId\`) AS \`klassTypeReferenceIds\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`students\` \`students\` ON \`students\`.\`id\` = \`student_klasses\`.\`studentReferenceId\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
            GROUP BY \`students\`.\`id\`
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
        `, ["meir_att_copy_ra","VIEW","student_by_year","SELECT `students`.`id` AS `id`, `students`.`tz` AS `tz`, `students`.`name` AS `name`, `students`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `student_klasses`.`year`) AS `year`, GROUP_CONCAT(DISTINCT `student_klasses`.`klassReferenceId`) AS `klassReferenceIds`, GROUP_CONCAT(DISTINCT `klasses`.`klassTypeReferenceId`) AS `klassTypeReferenceIds` FROM `student_klasses` `student_klasses` LEFT JOIN `students` `students` ON `students`.`id` = `student_klasses`.`studentReferenceId`  LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId` GROUP BY `students`.`id`"]);
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
        await queryRunner.query(`
            CREATE VIEW \`student_by_year\` AS
            SELECT \`students\`.\`id\` AS \`id\`,
                \`students\`.\`tz\` AS \`tz\`,
                \`students\`.\`name\` AS \`name\`,
                \`students\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`student_klasses\`.\`year\`) AS \`year\`,
                GROUP_CONCAT(DISTINCT \`student_klasses\`.\`klassReferenceId\`) AS \`klassReferenceIds\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`students\` \`students\` ON \`students\`.\`id\` = \`student_klasses\`.\`studentReferenceId\`
            GROUP BY \`students\`.\`id\`
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
        `, ["meir_att_copy_ra","VIEW","student_by_year","SELECT `students`.`id` AS `id`, `students`.`tz` AS `tz`, `students`.`name` AS `name`, `students`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `student_klasses`.`year`) AS `year`, GROUP_CONCAT(DISTINCT `student_klasses`.`klassReferenceId`) AS `klassReferenceIds` FROM `student_klasses` `student_klasses` LEFT JOIN `students` `students` ON `students`.`id` = `student_klasses`.`studentReferenceId` GROUP BY `students`.`id`"]);
    }

}
