import { MigrationInterface, QueryRunner } from "typeorm";

export class updateStudentKlassesReportAddStudentDetails1723482751870 implements MigrationInterface {
    name = 'updateStudentKlassesReportAddStudentDetails1723482751870'

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
                \`students\`.\`id\` AS \`id\`,
                \`students\`.\`tz\` AS \`student_tz\`,
                \`students\`.\`name\` AS \`student_name\`,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם',
                        \`student_klasses\`.\`klassReferenceId\`,
                        null
                    ) SEPARATOR ','
                ) AS \`klassReferenceId_1\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'מסלול',
                        \`student_klasses\`.\`klassReferenceId\`,
                        null
                    ) SEPARATOR ','
                ) AS \`klassReferenceId_2\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'התמחות',
                        \`student_klasses\`.\`klassReferenceId\`,
                        null
                    ) SEPARATOR ','
                ) AS \`klassReferenceId_3\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'אחר' || \`klass_types\`.\`klassTypeEnum\` is null,
                        \`student_klasses\`.\`klassReferenceId\`,
                        null
                    ) SEPARATOR ','
                ) AS \`klassReferenceId_null\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klass_name_1\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'מסלול',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klass_name_2\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'התמחות',
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klass_name_3\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'אחר' || \`klass_types\`.\`klassTypeEnum\` is null,
                        \`klasses\`.\`name\`,
                        null
                    ) SEPARATOR ', '
                ) AS \`klass_name_null\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
                LEFT JOIN \`students\` \`students\` ON \`students\`.\`id\` = \`student_klasses\`.\`studentReferenceId\`
            GROUP BY \`students\`.\`id\`,
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
        `, ["meir_att_copy_ra","VIEW","student_klasses_report","SELECT `student_klasses`.`year` AS `year`, `students`.`id` AS `id`, `students`.`tz` AS `student_tz`, `students`.`name` AS `student_name`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `student_klasses`.`klassReferenceId`, null) SEPARATOR ',') AS `klassReferenceId_1`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'מסלול', `student_klasses`.`klassReferenceId`, null) SEPARATOR ',') AS `klassReferenceId_2`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'התמחות', `student_klasses`.`klassReferenceId`, null) SEPARATOR ',') AS `klassReferenceId_3`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'אחר' || `klass_types`.`klassTypeEnum` is null, `student_klasses`.`klassReferenceId`, null) SEPARATOR ',') AS `klassReferenceId_null`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `klass_name_1`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'מסלול', `klasses`.`name`, null) SEPARATOR ', ') AS `klass_name_2`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'התמחות', `klasses`.`name`, null) SEPARATOR ', ') AS `klass_name_3`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'אחר' || `klass_types`.`klassTypeEnum` is null, `klasses`.`name`, null) SEPARATOR ', ') AS `klass_name_null` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId`  LEFT JOIN `students` `students` ON `students`.`id` = `student_klasses`.`studentReferenceId` GROUP BY `students`.`id`, `student_klasses`.`user_id`, `student_klasses`.`year`"]);
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
                \`students\`.\`id\` AS \`id\`,
                \`students\`.\`tz\` AS \`student_tz\`,
                \`students\`.\`name\` AS \`student_name\`,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'כיתת אם',
                        \`student_klasses\`.\`klassReferenceId\`,
                        null
                    ) SEPARATOR ','
                ) AS \`klassReferenceId_1\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'מסלול',
                        \`student_klasses\`.\`klassReferenceId\`,
                        null
                    ) SEPARATOR ','
                ) AS \`klassReferenceId_2\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'התמחות',
                        \`student_klasses\`.\`klassReferenceId\`,
                        null
                    ) SEPARATOR ','
                ) AS \`klassReferenceId_3\`,
                GROUP_CONCAT(
                    if(
                        \`klass_types\`.\`klassTypeEnum\` = 'אחר' || \`klass_types\`.\`klassTypeEnum\` is null,
                        \`student_klasses\`.\`klassReferenceId\`,
                        null
                    ) SEPARATOR ','
                ) AS \`klassReferenceId_null\`
            FROM \`student_klasses\` \`student_klasses\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`student_klasses\`.\`klassReferenceId\`
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klassTypeReferenceId\`
                LEFT JOIN \`students\` \`students\` ON \`students\`.\`id\` = \`student_klasses\`.\`studentReferenceId\`
            GROUP BY \`students\`.\`id\`,
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
        `, ["meir_att_copy_ra","VIEW","student_klasses_report","SELECT `student_klasses`.`year` AS `year`, `students`.`id` AS `id`, `students`.`tz` AS `student_tz`, `students`.`name` AS `student_name`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `student_klasses`.`klassReferenceId`, null) SEPARATOR ',') AS `klassReferenceId_1`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'מסלול', `student_klasses`.`klassReferenceId`, null) SEPARATOR ',') AS `klassReferenceId_2`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'התמחות', `student_klasses`.`klassReferenceId`, null) SEPARATOR ',') AS `klassReferenceId_3`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'אחר' || `klass_types`.`klassTypeEnum` is null, `student_klasses`.`klassReferenceId`, null) SEPARATOR ',') AS `klassReferenceId_null` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId`  LEFT JOIN `students` `students` ON `students`.`id` = `student_klasses`.`studentReferenceId` GROUP BY `students`.`id`, `student_klasses`.`user_id`, `student_klasses`.`year`"]);
    }

}
