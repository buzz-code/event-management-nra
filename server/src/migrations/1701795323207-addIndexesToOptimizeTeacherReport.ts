import { MigrationInterface, QueryRunner } from "typeorm";

export class addIndexesToOptimizeTeacherReport1701795323207 implements MigrationInterface {
    name = 'addIndexesToOptimizeTeacherReport1701795323207'

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
            CREATE INDEX \`IDX_271fe2dc910f3f148d020739ad\` ON \`lessons\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_87e1551245da7d48e9faa8504c\` ON \`att_reports\` (\`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_82f8943c2abf1da42d5ea056ec\` ON \`att_reports\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_214a4367cce39521a10dd18192\` ON \`att_reports\` (\`klassReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_ec7ecb76abb8c9d0fba2a453d8\` ON \`att_reports\` (\`lessonReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_a939d8e9cdb002cc936476d223\` ON \`att_reports\` (\`report_date\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_cb5e566bb60eecc1a258f5a9b3\` ON \`grades\` (\`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_130727be2ecc7acba14fc372c5\` ON \`grades\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_22b82e90fafad45190f692dd05\` ON \`grades\` (\`klassReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_69b8e100956b4789bd40ef793a\` ON \`grades\` (\`lessonReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_c9c2f94f61f2af5e67061f5490\` ON \`grades\` (\`report_date\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_562609ef14135b04bfbc29c504\` ON \`report_month\` (\`userId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_c26ca93193d447559f28a179f0\` ON \`report_month\` (\`startDate\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_238410e9e94aea1e793799ac84\` ON \`report_month\` (\`endDate\`)
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
            DROP INDEX \`IDX_238410e9e94aea1e793799ac84\` ON \`report_month\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c26ca93193d447559f28a179f0\` ON \`report_month\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_562609ef14135b04bfbc29c504\` ON \`report_month\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c9c2f94f61f2af5e67061f5490\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_69b8e100956b4789bd40ef793a\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_22b82e90fafad45190f692dd05\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_130727be2ecc7acba14fc372c5\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_cb5e566bb60eecc1a258f5a9b3\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a939d8e9cdb002cc936476d223\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_ec7ecb76abb8c9d0fba2a453d8\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_214a4367cce39521a10dd18192\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_82f8943c2abf1da42d5ea056ec\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_87e1551245da7d48e9faa8504c\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_271fe2dc910f3f148d020739ad\` ON \`lessons\`
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
