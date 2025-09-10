import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFilepathToText1757422446869 implements MigrationInterface {
    name = 'AddFilepathToText1757422446869'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`event_management_nra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","text_by_user","event_management_nra"]);
        await queryRunner.query(`
            DROP VIEW \`text_by_user\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\`
            ADD \`filepath\` varchar(255) NULL
        `);
        await queryRunner.query(`
            CREATE VIEW \`text_by_user\` AS
            SELECT \`t_base\`.\`name\` AS \`name\`,
                \`t_base\`.\`description\` AS \`description\`,
                \`users\`.\`id\` AS \`userId\`,
                \`t_user\`.\`id\` AS \`overrideTextId\`,
                CONCAT(\`users\`.\`id\`, "_", \`t_base\`.\`id\`) AS \`id\`,
                COALESCE(\`t_user\`.\`value\`, \`t_base\`.\`value\`) AS \`value\`,
                COALESCE(\`t_user\`.\`filepath\`, \`t_base\`.\`filepath\`) AS \`filepath\`
            FROM \`texts\` \`t_base\`
                LEFT JOIN \`users\` \`users\` ON \`users\`.\`effective_id\` is null
                LEFT JOIN \`texts\` \`t_user\` ON \`t_user\`.\`name\` = \`t_base\`.\`name\`
                AND \`t_user\`.\`user_id\` = \`users\`.\`id\`
            WHERE \`t_base\`.\`user_id\` = 0
            ORDER BY \`users\`.\`id\` ASC,
                \`t_base\`.\`id\` ASC
        `);
        await queryRunner.query(`
            INSERT INTO \`event_management_nra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["event_management_nra","VIEW","text_by_user","SELECT `t_base`.`name` AS `name`, `t_base`.`description` AS `description`, `users`.`id` AS `userId`, `t_user`.`id` AS `overrideTextId`, CONCAT(`users`.`id`, \"_\", `t_base`.`id`) AS `id`, COALESCE(`t_user`.`value`, `t_base`.`value`) AS `value`, COALESCE(`t_user`.`filepath`, `t_base`.`filepath`) AS `filepath` FROM `texts` `t_base` LEFT JOIN `users` `users` ON `users`.`effective_id` is null  LEFT JOIN `texts` `t_user` ON `t_user`.`name` = `t_base`.`name` AND `t_user`.`user_id` = `users`.`id` WHERE `t_base`.`user_id` = 0 ORDER BY `users`.`id` ASC, `t_base`.`id` ASC"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`event_management_nra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","text_by_user","event_management_nra"]);
        await queryRunner.query(`
            DROP VIEW \`text_by_user\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\` DROP COLUMN \`filepath\`
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
                LEFT JOIN \`users\` \`users\` ON \`users\`.\`effective_id\` is null
                LEFT JOIN \`texts\` \`t_user\` ON \`t_user\`.\`name\` = \`t_base\`.\`name\`
                AND \`t_user\`.\`user_id\` = \`users\`.\`id\`
            WHERE \`t_base\`.\`user_id\` = 0
            ORDER BY \`users\`.\`id\` ASC,
                \`t_base\`.\`id\` ASC
        `);
        await queryRunner.query(`
            INSERT INTO \`event_management_nra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["event_management_nra","VIEW","text_by_user","SELECT `t_base`.`name` AS `name`, `t_base`.`description` AS `description`, `users`.`id` AS `userId`, `t_user`.`id` AS `overrideTextId`, CONCAT(`users`.`id`, \"_\", `t_base`.`id`) AS `id`, COALESCE(`t_user`.`value`, `t_base`.`value`) AS `value` FROM `texts` `t_base` LEFT JOIN `users` `users` ON `users`.`effective_id` is null  LEFT JOIN `texts` `t_user` ON `t_user`.`name` = `t_base`.`name` AND `t_user`.`user_id` = `users`.`id` WHERE `t_base`.`user_id` = 0 ORDER BY `users`.`id` ASC, `t_base`.`id` ASC"]);
    }

}
