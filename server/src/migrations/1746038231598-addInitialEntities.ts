import { MigrationInterface, QueryRunner } from "typeorm";

export class addInitialEntities1746038231598 implements MigrationInterface {
    name = 'addInitialEntities1746038231598'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`audit_log\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`entityId\` int NOT NULL,
                \`entityName\` varchar(255) NOT NULL,
                \`operation\` varchar(255) NOT NULL,
                \`entityData\` text NOT NULL,
                \`isReverted\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`image\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`imageTarget\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`fileDataSrc\` mediumtext NOT NULL,
                \`fileDataTitle\` text NOT NULL,
                UNIQUE INDEX \`IDX_35596848f8bb8f7b5ec5fcf9e0\` (\`userId\`, \`imageTarget\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`import_file\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`fileName\` varchar(255) NOT NULL,
                \`fileSource\` varchar(255) NOT NULL,
                \`entityIds\` text NOT NULL,
                \`entityName\` varchar(255) NOT NULL,
                \`fullSuccess\` tinyint NULL,
                \`response\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`mail_address\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`alias\` varchar(255) NOT NULL,
                \`entity\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_10d2242b0e45f6add0b4269cbf\` (\`userId\`, \`entity\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`page\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`description\` varchar(255) NOT NULL,
                \`value\` longtext NOT NULL,
                \`order\` int NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`payment_track\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` longtext NOT NULL,
                \`monthlyPrice\` int NOT NULL,
                \`annualPrice\` int NOT NULL,
                \`studentNumberLimit\` int NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`recieved_mail\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`mailData\` text NOT NULL,
                \`from\` varchar(255) NOT NULL,
                \`to\` varchar(255) NOT NULL,
                \`subject\` text NULL,
                \`body\` text NULL,
                \`entityName\` varchar(255) NOT NULL,
                \`importFileIds\` text NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`texts\` (
                \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`description\` varchar(100) NOT NULL,
                \`value\` varchar(10000) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`texts_user_id_name_idx\` (\`user_id\`, \`name\`),
                INDEX \`texts_name_idx\` (\`name\`),
                INDEX \`texts_users_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(500) NOT NULL,
                \`email\` varchar(500) NULL,
                \`password\` varchar(500) NULL,
                \`phone_number\` varchar(11) NULL,
                \`active\` tinyint NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`effective_id\` int NULL,
                \`permissions\` text NULL,
                \`additionalData\` text NULL,
                \`userInfo\` text NULL,
                \`isPaid\` tinyint NOT NULL DEFAULT 0,
                \`paymentMethod\` varchar(255) NULL,
                \`mailAddressAlias\` varchar(255) NULL,
                \`mailAddressTitle\` varchar(255) NULL,
                \`paymentTrackId\` int NULL,
                \`bccAddress\` varchar(255) NULL,
                INDEX \`user_phone_number_idx\` (\`phone_number\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`yemot_call\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`apiCallId\` varchar(255) NOT NULL,
                \`phone\` varchar(255) NOT NULL,
                \`history\` mediumtext NOT NULL,
                \`currentStep\` varchar(255) NOT NULL,
                \`data\` text NULL,
                \`isOpen\` tinyint NOT NULL,
                \`hasError\` tinyint NOT NULL DEFAULT 0,
                \`errorMessage\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`yemot_call_api_call_id_idx\` (\`apiCallId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`event_types\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`teachers\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NULL,
                \`userReferenceId\` int NULL,
                \`first_name\` varchar(255) NOT NULL,
                \`last_name\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`teachers_name_idx\` (\`first_name\`, \`last_name\`),
                INDEX \`teachers_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`event_notes\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`eventId\` int NULL,
                \`eventReferenceId\` int NOT NULL,
                \`authorId\` int NULL,
                \`authorReferenceId\` int NULL,
                \`note_text\` text NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`event_notes_author_id_idx\` (\`authorReferenceId\`),
                INDEX \`event_notes_event_id_idx\` (\`eventReferenceId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`gifts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`event_gifts\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`eventId\` int NULL,
                \`eventReferenceId\` int NOT NULL,
                \`giftId\` int NULL,
                \`giftReferenceId\` int NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`event_gifts_gift_id_idx\` (\`giftReferenceId\`),
                INDEX \`event_gifts_event_id_idx\` (\`eventReferenceId\`),
                UNIQUE INDEX \`IDX_49ecdf64dd02d36d7423b04708\` (\`eventReferenceId\`, \`giftReferenceId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`events\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`title\` varchar(255) NOT NULL,
                \`description\` text NULL,
                \`start_date\` datetime NOT NULL,
                \`end_date\` datetime NOT NULL,
                \`completed\` tinyint NOT NULL DEFAULT 0,
                \`grade\` decimal(5, 2) NULL,
                \`eventTypeId\` int NULL,
                \`eventTypeReferenceId\` int NULL,
                \`teacherId\` int NULL,
                \`teacherReferenceId\` int NULL,
                \`studentId\` int NULL,
                \`studentReferenceId\` int NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`events_end_date_idx\` (\`end_date\`),
                INDEX \`events_start_date_idx\` (\`start_date\`),
                INDEX \`events_student_id_idx\` (\`studentReferenceId\`),
                INDEX \`events_teacher_id_idx\` (\`teacherReferenceId\`),
                INDEX \`events_event_type_id_idx\` (\`eventTypeReferenceId\`),
                INDEX \`events_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`students\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`class_id\` int NULL,
                \`classReferenceId\` int NULL,
                \`first_name\` varchar(255) NOT NULL,
                \`last_name\` varchar(255) NOT NULL,
                \`address\` text NULL,
                \`mother_name\` varchar(255) NULL,
                \`mother_contact\` varchar(255) NULL,
                \`father_name\` varchar(255) NULL,
                \`father_contact\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`students_name_idx\` (\`first_name\`, \`last_name\`),
                INDEX \`students_class_id_idx\` (\`classReferenceId\`),
                INDEX \`students_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`classes\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`grade_level\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`classes_name_idx\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`yemot_call\`
            ADD CONSTRAINT \`FK_2f2c39a9491ac1a6e2d7827bb53\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD CONSTRAINT \`FK_33bfc593b368cc8550fc901824b\` FOREIGN KEY (\`userReferenceId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD CONSTRAINT \`FK_11b8178349b9da9e78b5ebca677\` FOREIGN KEY (\`eventReferenceId\`) REFERENCES \`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD CONSTRAINT \`FK_39c465c063fe658707ce021b8ed\` FOREIGN KEY (\`authorReferenceId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD CONSTRAINT \`FK_b6b55a287c3c3e41880bf2ef47d\` FOREIGN KEY (\`eventReferenceId\`) REFERENCES \`events\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD CONSTRAINT \`FK_78b1a4b4bc4ad238b51cf51118b\` FOREIGN KEY (\`giftReferenceId\`) REFERENCES \`gifts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_b2c5199d6122113e616a9202f5d\` FOREIGN KEY (\`eventTypeReferenceId\`) REFERENCES \`event_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_5c23a238694da06fcb4945ebe7f\` FOREIGN KEY (\`teacherReferenceId\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_839f8cfeea5757c419a69a7ea34\` FOREIGN KEY (\`studentReferenceId\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD CONSTRAINT \`FK_5767c90fe7d0c96789b4e0f848b\` FOREIGN KEY (\`classReferenceId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
            INSERT INTO \`event_management_nra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["event_management_nra","VIEW","text_by_user","SELECT `t_base`.`name` AS `name`, `t_base`.`description` AS `description`, `users`.`id` AS `userId`, `t_user`.`id` AS `overrideTextId`, CONCAT(`users`.`id`, \"_\", `t_base`.`id`) AS `id`, COALESCE(`t_user`.`value`, `t_base`.`value`) AS `value` FROM `texts` `t_base` LEFT JOIN `users` `users` ON 1 = 1  LEFT JOIN `texts` `t_user` ON `t_user`.`name` = `t_base`.`name` AND `t_user`.`user_id` = `users`.`id` WHERE `t_base`.`user_id` = 0 ORDER BY `users`.`id` ASC, `t_base`.`id` ASC"]);
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
            ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_5767c90fe7d0c96789b4e0f848b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_839f8cfeea5757c419a69a7ea34\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_5c23a238694da06fcb4945ebe7f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_b2c5199d6122113e616a9202f5d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP FOREIGN KEY \`FK_78b1a4b4bc4ad238b51cf51118b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP FOREIGN KEY \`FK_b6b55a287c3c3e41880bf2ef47d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP FOREIGN KEY \`FK_39c465c063fe658707ce021b8ed\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP FOREIGN KEY \`FK_11b8178349b9da9e78b5ebca677\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP FOREIGN KEY \`FK_33bfc593b368cc8550fc901824b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`yemot_call\` DROP FOREIGN KEY \`FK_2f2c39a9491ac1a6e2d7827bb53\`
        `);
        await queryRunner.query(`
            DROP INDEX \`classes_name_idx\` ON \`classes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`classes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`students_user_id_idx\` ON \`students\`
        `);
        await queryRunner.query(`
            DROP INDEX \`students_class_id_idx\` ON \`students\`
        `);
        await queryRunner.query(`
            DROP INDEX \`students_name_idx\` ON \`students\`
        `);
        await queryRunner.query(`
            DROP TABLE \`students\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_user_id_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_event_type_id_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_teacher_id_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_student_id_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_start_date_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_end_date_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP TABLE \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_49ecdf64dd02d36d7423b04708\` ON \`event_gifts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`event_gifts_event_id_idx\` ON \`event_gifts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`event_gifts_gift_id_idx\` ON \`event_gifts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`event_gifts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`gifts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`event_notes_event_id_idx\` ON \`event_notes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`event_notes_author_id_idx\` ON \`event_notes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`event_notes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`teachers_user_id_idx\` ON \`teachers\`
        `);
        await queryRunner.query(`
            DROP INDEX \`teachers_name_idx\` ON \`teachers\`
        `);
        await queryRunner.query(`
            DROP TABLE \`teachers\`
        `);
        await queryRunner.query(`
            DROP TABLE \`event_types\`
        `);
        await queryRunner.query(`
            DROP INDEX \`yemot_call_api_call_id_idx\` ON \`yemot_call\`
        `);
        await queryRunner.query(`
            DROP TABLE \`yemot_call\`
        `);
        await queryRunner.query(`
            DROP INDEX \`user_phone_number_idx\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`users\`
        `);
        await queryRunner.query(`
            DROP INDEX \`texts_users_idx\` ON \`texts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`texts_name_idx\` ON \`texts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`texts_user_id_name_idx\` ON \`texts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`texts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`recieved_mail\`
        `);
        await queryRunner.query(`
            DROP TABLE \`payment_track\`
        `);
        await queryRunner.query(`
            DROP TABLE \`page\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_10d2242b0e45f6add0b4269cbf\` ON \`mail_address\`
        `);
        await queryRunner.query(`
            DROP TABLE \`mail_address\`
        `);
        await queryRunner.query(`
            DROP TABLE \`import_file\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_35596848f8bb8f7b5ec5fcf9e0\` ON \`image\`
        `);
        await queryRunner.query(`
            DROP TABLE \`image\`
        `);
        await queryRunner.query(`
            DROP TABLE \`audit_log\`
        `);
    }

}
