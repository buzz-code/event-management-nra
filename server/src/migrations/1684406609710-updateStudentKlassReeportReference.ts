import { MigrationInterface, QueryRunner } from "typeorm";

export class updateStudentKlassReeportReference1684406609710 implements MigrationInterface {
    name = 'updateStudentKlassReeportReference1684406609710'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_klasses_report","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_klasses_report\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_klasses_report\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
                COALESCE(studentReferenceId, student_tz) AS \`id\`,
                student_tz,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klasses_1\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'מסלול',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klasses_2\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'התמחות',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klasses_3\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'אחר' || \`klass_types\`.\`klassTypeEnum\` is null,
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klasses_null\`
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
            GROUP BY \`student_klasses\`.\`studentReferenceId\`,
                \`student_klasses\`.\`student_tz\`,
                \`student_klasses\`.\`user_id\`,
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
        `, ["meir_att_copy_ra","VIEW","student_klasses_report","SELECT `student_klasses`.`year` AS `year`, COALESCE(studentReferenceId, student_tz) AS `id`, student_tz, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `klasses_1`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'מסלול', `klasses`.`name`, null) SEPARATOR ', ') AS `klasses_2`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'התמחות', `klasses`.`name`, null) SEPARATOR ', ') AS `klasses_3`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'אחר' || `klass_types`.`klassTypeEnum` is null, `klasses`.`name`, null) SEPARATOR ', ') AS `klasses_null` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId` OR (`klasses`.`key` = `student_klasses`.`klass_id` AND `klasses`.`user_id` = `student_klasses`.`user_id`)  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId` OR (`klass_types`.`id` = `klasses`.`klass_type_id` AND `klass_types`.`user_id` = `klasses`.`user_id`) GROUP BY `student_klasses`.`studentReferenceId`, `student_klasses`.`student_tz`, `student_klasses`.`user_id`, `student_klasses`.`year`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","student_klasses_report","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`student_klasses_report\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_klasses_report\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
                student_tz,
                student_tz AS \`id\`,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klasses_1\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'מסלול',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klasses_2\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'התמחות',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klasses_3\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'אחר' || \`klass_types\`.\`klassTypeEnum\` is null,
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klasses_null\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`key\` = \`student_klasses\`.\`klass_id\`
                AND \`klasses\`.\`user_id\` = \`student_klasses\`.\`user_id\`
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klass_type_id\`
                AND \`klass_types\`.\`user_id\` = \`klasses\`.\`user_id\`
            GROUP BY student_tz,
                \`student_klasses\`.\`user_id\`,
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
        `, ["meir_att_copy_ra","VIEW","student_klasses_report","SELECT `student_klasses`.`year` AS `year`, student_tz, student_tz AS `id`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `klasses_1`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'מסלול', `klasses`.`name`, null) SEPARATOR ', ') AS `klasses_2`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'התמחות', `klasses`.`name`, null) SEPARATOR ', ') AS `klasses_3`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'אחר' || `klass_types`.`klassTypeEnum` is null, `klasses`.`name`, null) SEPARATOR ', ') AS `klasses_null` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`key` = `student_klasses`.`klass_id` AND `klasses`.`user_id` = `student_klasses`.`user_id`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klass_type_id` AND `klass_types`.`user_id` = `klasses`.`user_id` GROUP BY student_tz, `student_klasses`.`user_id`, `student_klasses`.`year`"]);
    }

}
