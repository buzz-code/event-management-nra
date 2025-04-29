import { MigrationInterface, QueryRunner } from "typeorm";

export class optimizeStudentBaseKlass1708547635746 implements MigrationInterface {
    name = 'optimizeStudentBaseKlass1708547635746'

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
            CREATE INDEX \`IDX_9a2642196187f93e9fd8d20529\` ON \`klasses\` (\`klassTypeReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_c4c70577f3547af4b76cdc5c0a\` ON \`klasses\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`student_klasses_user_student_klass_year_idx\` ON \`student_klasses\` (
                \`user_id\`,
                \`studentReferenceId\`,
                \`klassReferenceId\`,
                \`year\`
            )
        `);
        await queryRunner.query(`
            CREATE INDEX \`student_klasses_student_reference_id_year_idx\` ON \`student_klasses\` (\`studentReferenceId\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`student_klasses_user_year_idx\` ON \`student_klasses\` (\`user_id\`, \`year\`)
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
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, studentReferenceId AS `id`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId` GROUP BY studentReferenceId, user_id, year"]);
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
            DROP INDEX \`student_klasses_user_year_idx\` ON \`student_klasses\`
        `);
        await queryRunner.query(`
            DROP INDEX \`student_klasses_student_reference_id_year_idx\` ON \`student_klasses\`
        `);
        await queryRunner.query(`
            DROP INDEX \`student_klasses_user_student_klass_year_idx\` ON \`student_klasses\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c4c70577f3547af4b76cdc5c0a\` ON \`klasses\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_9a2642196187f93e9fd8d20529\` ON \`klasses\`
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

}
