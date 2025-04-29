import { MigrationInterface, QueryRunner } from "typeorm";

export class removeTzFromStudentBaseKlassView1701162232786 implements MigrationInterface {
    name = 'removeTzFromStudentBaseKlassView1701162232786'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_base_klass","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_base_klass\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_base_klass\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
                studentReferenceId AS \`id\`,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`base_klass\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
                OR (
                    \`klasses\`.\`key\` = \`student_klasses\`.\`klass_id\`
                    AND \`klasses\`.\`user_id\` = \`student_klasses\`.\`user_id\`
                )
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
                OR (
                    \`klass_types\`.\`id\` = \`klasses\`.\`klass_type_id\`
                    AND \`klass_types\`.\`user_id\` = \`klasses\`.\`user_id\`
                )
            GROUP BY studentReferenceId,
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, studentReferenceId AS `id`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId` OR (`klasses`.`key` = `student_klasses`.`klass_id` AND `klasses`.`user_id` = `student_klasses`.`user_id`)  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId` OR (`klass_types`.`id` = `klasses`.`klass_type_id` AND `klass_types`.`user_id` = `klasses`.`user_id`) GROUP BY studentReferenceId, user_id, year"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_base_klass","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_base_klass\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_base_klass\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
                studentReferenceId AS \`id\`,
                student_tz AS \`tz\`,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`base_klass\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
                OR (
                    \`klasses\`.\`key\` = \`student_klasses\`.\`klass_id\`
                    AND \`klasses\`.\`user_id\` = \`student_klasses\`.\`user_id\`
                )
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
                OR (
                    \`klass_types\`.\`id\` = \`klasses\`.\`klass_type_id\`
                    AND \`klass_types\`.\`user_id\` = \`klasses\`.\`user_id\`
                )
            GROUP BY studentReferenceId,
                student_tz,
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, studentReferenceId AS `id`, student_tz AS `tz`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId` OR (`klasses`.`key` = `student_klasses`.`klass_id` AND `klasses`.`user_id` = `student_klasses`.`user_id`)  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId` OR (`klass_types`.`id` = `klasses`.`klass_type_id` AND `klass_types`.`user_id` = `klasses`.`user_id`) GROUP BY studentReferenceId, student_tz, user_id, year"]);
    }

}
