import { MigrationInterface, QueryRunner } from "typeorm";

export class updateStudentBaseKlass1676373585567 implements MigrationInterface {
    name = 'updateStudentBaseKlass1676373585567'

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
            ALTER TABLE \`klasses\` DROP FOREIGN KEY \`FK_5a35b47ffd2c5e722e8b0b3cf89\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_284ec0d1b23c78061dd15e5be1\` ON \`teachers\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` CHANGE \`year\` \`year\` int NULL
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_b79f5a3d6f4c83df7d03fcf1a3\` ON \`klasses\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\` CHANGE \`year\` \`year\` int NULL
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_95dda12bd0a76cf4a439da99fe\` ON \`lessons\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`lessons\` CHANGE \`year\` \`year\` int NULL
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_53f436b35b00a4bcb00bfa08ce\` ON \`students\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` CHANGE \`year\` \`year\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`year\` \`year\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`year\` \`year\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` CHANGE \`year\` \`year\` int NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_284ec0d1b23c78061dd15e5be1\` ON \`teachers\` (\`user_id\`, \`tz\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_b79f5a3d6f4c83df7d03fcf1a3\` ON \`klasses\` (\`user_id\`, \`key\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_95dda12bd0a76cf4a439da99fe\` ON \`lessons\` (\`user_id\`, \`key\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_53f436b35b00a4bcb00bfa08ce\` ON \`students\` (\`user_id\`, \`tz\`, \`year\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\`
            ADD CONSTRAINT \`FK_9a2642196187f93e9fd8d20529e\` FOREIGN KEY (\`klassTypeReferenceId\`) REFERENCES \`klass_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, student_tz AS `tz`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`key` = `student_klasses`.`klass_id` AND `klasses`.`user_id` = `student_klasses`.`user_id`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klass_type_id` AND `klass_types`.`user_id` = `klasses`.`user_id` GROUP BY studentReferenceId, student_tz, user_id, year"]);
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
            ALTER TABLE \`klasses\` DROP FOREIGN KEY \`FK_9a2642196187f93e9fd8d20529e\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_53f436b35b00a4bcb00bfa08ce\` ON \`students\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_95dda12bd0a76cf4a439da99fe\` ON \`lessons\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_b79f5a3d6f4c83df7d03fcf1a3\` ON \`klasses\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_284ec0d1b23c78061dd15e5be1\` ON \`teachers\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` CHANGE \`year\` \`year\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`year\` \`year\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`year\` \`year\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` CHANGE \`year\` \`year\` int NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_53f436b35b00a4bcb00bfa08ce\` ON \`students\` (\`user_id\`, \`tz\`, \`year\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`lessons\` CHANGE \`year\` \`year\` int NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_95dda12bd0a76cf4a439da99fe\` ON \`lessons\` (\`user_id\`, \`key\`, \`year\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\` CHANGE \`year\` \`year\` int NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_b79f5a3d6f4c83df7d03fcf1a3\` ON \`klasses\` (\`user_id\`, \`key\`, \`year\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` CHANGE \`year\` \`year\` int NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_284ec0d1b23c78061dd15e5be1\` ON \`teachers\` (\`user_id\`, \`tz\`, \`year\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\`
            ADD CONSTRAINT \`FK_5a35b47ffd2c5e722e8b0b3cf89\` FOREIGN KEY (\`user_id\`, \`klass_type_id\`) REFERENCES \`klass_types\`(\`user_id\`, \`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
            GROUP BY student_tz,
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, student_tz AS `tz`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`key` = `student_klasses`.`klass_id` AND `klasses`.`user_id` = `student_klasses`.`user_id`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klass_type_id` AND `klass_types`.`user_id` = `klasses`.`user_id` GROUP BY student_tz, user_id, year"]);
    }

}
