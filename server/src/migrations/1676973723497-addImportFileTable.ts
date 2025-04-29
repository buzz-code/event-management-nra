import { MigrationInterface, QueryRunner } from "typeorm";

export class addImportFileTable1676973723497 implements MigrationInterface {
    name = 'addImportFileTable1676973723497'

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
            DROP INDEX \`FK_5a35b47ffd2c5e722e8b0b3cf89\` ON \`klasses\`
        `);
        await queryRunner.query(`
            CREATE TABLE \`import_file\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`fileName\` varchar(255) NOT NULL,
                \`entityIds\` text NOT NULL,
                \`entityName\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
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
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`key\` = \`student_klasses\`.\`klass_id\`
                AND \`klasses\`.\`user_id\` = \`student_klasses\`.\`user_id\`
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klass_type_id\`
                AND \`klass_types\`.\`user_id\` = \`klasses\`.\`user_id\`
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, studentReferenceId AS `id`, student_tz AS `tz`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`key` = `student_klasses`.`klass_id` AND `klasses`.`user_id` = `student_klasses`.`user_id`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klass_type_id` AND `klass_types`.`user_id` = `klasses`.`user_id` GROUP BY studentReferenceId, student_tz, user_id, year"]);
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
            DROP TABLE \`import_file\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`FK_5a35b47ffd2c5e722e8b0b3cf89\` ON \`klasses\` (\`user_id\`, \`klass_type_id\`)
        `);
        await queryRunner.query(`
            CREATE VIEW \`student_base_klass\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
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
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`key\` = \`student_klasses\`.\`klass_id\`
                AND \`klasses\`.\`user_id\` = \`student_klasses\`.\`user_id\`
                LEFT JOIN \`klass_types\` \`klass_types\` ON \`klass_types\`.\`id\` = \`klasses\`.\`klass_type_id\`
                AND \`klass_types\`.\`user_id\` = \`klasses\`.\`user_id\`
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, student_tz AS `tz`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`key` = `student_klasses`.`klass_id` AND `klasses`.`user_id` = `student_klasses`.`user_id`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klass_type_id` AND `klass_types`.`user_id` = `klasses`.`user_id` GROUP BY studentReferenceId, student_tz, user_id, year"]);
    }

}
