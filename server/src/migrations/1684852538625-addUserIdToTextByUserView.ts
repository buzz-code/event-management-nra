import { MigrationInterface, QueryRunner } from "typeorm";

export class addUserIdToTextByUserView1684852538625 implements MigrationInterface {
    name = 'addUserIdToTextByUserView1684852538625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","text_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`text_by_user\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`text_by_user\` AS
            SELECT \`t_base\`.\`name\` AS \`name\`,
                \`t_base\`.\`description\` AS \`description\`,
                \`users\`.\`id\` AS \`userId\`,
                \`t_user\`.\`id\` AS \`overrideTextId\`,
                CONCAT(\`users\`.\`id\`, "_", \`t_base\`.\`id\`) AS \`id\`,
                COALESCE(\`t_user\`.\`value\`, \`t_base\`.\`value\`) AS \`value\`
            FROM \`texts\` \`t_base\`
                LEFT JOIN \`users\` \`users\` ON 1 = 1
                LEFT JOIN \`texts\` \`t_user\` ON \`t_user\`.\`name\` = \`t_base\`.\`name\`
                AND \`t_user\`.\`user_id\` = \`users\`.\`id\`
            WHERE \`t_base\`.\`user_id\` = 0
            ORDER BY \`users\`.\`id\` ASC,
                \`t_base\`.\`id\` ASC
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
        `, ["meir_att_copy_ra","VIEW","text_by_user","SELECT `t_base`.`name` AS `name`, `t_base`.`description` AS `description`, `users`.`id` AS `userId`, `t_user`.`id` AS `overrideTextId`, CONCAT(`users`.`id`, \"_\", `t_base`.`id`) AS `id`, COALESCE(`t_user`.`value`, `t_base`.`value`) AS `value` FROM `texts` `t_base` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `texts` `t_user` ON `t_user`.`name` = `t_base`.`name` AND `t_user`.`user_id` = `users`.`id` WHERE `t_base`.`user_id` = 0 ORDER BY `users`.`id` ASC, `t_base`.`id` ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`meir_att_copy_ra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","text_by_user","meir_att_copy_ra"]);
        await queryRunner.query(`
            DROP VIEW \`text_by_user\`
        `);
        await queryRunner.query(`
            CREATE VIEW \`text_by_user\` AS
            SELECT \`t_base\`.\`name\` AS \`name\`,
                \`t_base\`.\`description\` AS \`description\`,
                \`t_user\`.\`id\` AS \`overrideTextId\`,
                CONCAT(\`users\`.\`id\`, "_", \`t_base\`.\`id\`) AS \`id\`,
                COALESCE(\`t_user\`.\`value\`, \`t_base\`.\`value\`) AS \`value\`
            FROM \`texts\` \`t_base\`
                LEFT JOIN \`users\` \`users\` ON 1 = 1
                LEFT JOIN \`texts\` \`t_user\` ON \`t_user\`.\`name\` = \`t_base\`.\`name\`
                AND \`t_user\`.\`user_id\` = \`users\`.\`id\`
            WHERE \`t_base\`.\`user_id\` = 0
            ORDER BY \`users\`.\`id\` ASC,
                \`t_base\`.\`id\` ASC
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
        `, ["meir_att_copy_ra","VIEW","text_by_user","SELECT `t_base`.`name` AS `name`, `t_base`.`description` AS `description`, `t_user`.`id` AS `overrideTextId`, CONCAT(`users`.`id`, \"_\", `t_base`.`id`) AS `id`, COALESCE(`t_user`.`value`, `t_base`.`value`) AS `value` FROM `texts` `t_base` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `texts` `t_user` ON `t_user`.`name` = `t_base`.`name` AND `t_user`.`user_id` = `users`.`id` WHERE `t_base`.`user_id` = 0 ORDER BY `users`.`id` ASC, `t_base`.`id` ASC"]);
    }

}
