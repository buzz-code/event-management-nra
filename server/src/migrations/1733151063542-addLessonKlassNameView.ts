import { MigrationInterface, QueryRunner } from "typeorm";

export class addLessonKlassNameView1733151063542 implements MigrationInterface {
    name = 'addLessonKlassNameView1733151063542'

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
            CREATE VIEW \`lesson_klass_name\` AS
            SELECT \`lessons\`.\`id\` AS \`id\`,
                \`lessons\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(DISTINCT \`klasses\`.\`name\` SEPARATOR ', ') AS \`name\`
            FROM \`lessons\` \`lessons\`
                LEFT JOIN \`klasses\` \`klasses\` ON \`klasses\`.\`id\` = \`lessons\`.\`klassReferenceIds\`
                OR FIND_IN_SET(\`klasses\`.\`id\`, \`lessons\`.\`klassReferenceIds\`)
            GROUP BY \`lessons\`.\`id\`
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
        `, ["meir_att_copy_ra","VIEW","lesson_klass_name","SELECT `lessons`.`id` AS `id`, `lessons`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT `klasses`.`name` SEPARATOR ', ') AS `name` FROM `lessons` `lessons` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `lessons`.`klassReferenceIds` OR FIND_IN_SET(`klasses`.`id`, `lessons`.`klassReferenceIds`) GROUP BY `lessons`.`id`"]);
        await queryRunner.query(`
            CREATE VIEW \`student_base_klass\` AS
            SELECT \`student_klasses\`.\`year\` AS \`year\`,
                studentReferenceId AS \`id\`,
                \`student_klasses\`.\`user_id\` AS \`user_id\`,
                GROUP_CONCAT(
                    DISTINCT if(
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
        `, ["meir_att_copy_ra","VIEW","student_base_klass","SELECT `student_klasses`.`year` AS `year`, studentReferenceId AS `id`, `student_klasses`.`user_id` AS `user_id`, GROUP_CONCAT(DISTINCT if(`klass_types`.`klassTypeEnum` = 'כיתת אם', `klasses`.`name`, null) SEPARATOR ', ') AS `base_klass` FROM `student_klasses` `student_klasses` LEFT JOIN `klasses` `klasses` ON `klasses`.`id` = `student_klasses`.`klassReferenceId`  LEFT JOIN `klass_types` `klass_types` ON `klass_types`.`id` = `klasses`.`klassTypeReferenceId` GROUP BY studentReferenceId, user_id, year"]);
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
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","lesson_klass_name","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`lesson_klass_name\`
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

}
