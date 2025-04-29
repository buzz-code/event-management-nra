import { MigrationInterface, QueryRunner } from "typeorm";

export class adGradeEffectByUserView1705777705679 implements MigrationInterface {
    name = 'adGradeEffectByUserView1705777705679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE VIEW \`grade_effect_by_user\` AS
            SELECT \`users\`.\`id\` AS \`userId\`,
                CONCAT(\`users\`.\`id\`, "_", numbers.number) AS \`id\`,
                numbers.number AS \`number\`,
                MAX(\`att_grade_effect\`.\`effect\`) AS \`effect\`
            FROM \`numbers\` \`numbers\`
                LEFT JOIN \`users\` \`users\` ON 1 = 1
                LEFT JOIN \`att_grade_effect\` \`att_grade_effect\` ON \`att_grade_effect\`.\`user_id\` = \`users\`.\`id\`
                AND \`att_grade_effect\`.\`percents\` <= numbers.number
            GROUP BY \`users\`.\`id\`,
                numbers.number
            ORDER BY \`users\`.\`id\` ASC,
                numbers.number ASC
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
        `, ["meir_att_copy_ra","VIEW","grade_effect_by_user","SELECT `users`.`id` AS `userId`, CONCAT(`users`.`id`, \"_\", numbers.number) AS `id`, numbers.number AS `number`, MAX(`att_grade_effect`.`effect`) AS `effect` FROM `numbers` `numbers` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `att_grade_effect` `att_grade_effect` ON `att_grade_effect`.`user_id` = `users`.`id` AND `att_grade_effect`.`percents` <= numbers.number GROUP BY `users`.`id`, numbers.number ORDER BY `users`.`id` ASC, numbers.number ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","grade_effect_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`grade_effect_by_user\`
        `);
    }

}
