import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPhoneCampaign1780185600000 implements MigrationInterface {
    name = 'AddPhoneCampaign1780185600000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`phone_templates\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`name\` varchar(100) NOT NULL,
                \`description\` varchar(500) NULL,
                \`yemot_template_id\` varchar(255) NULL,
                \`message_type\` varchar(50) NOT NULL DEFAULT 'text',
                \`message_text\` text NOT NULL,
                \`is_active\` tinyint NOT NULL DEFAULT 1,
                \`caller_id\` varchar(20) NULL,
                \`settings\` text NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`phone_template_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`phone_campaigns\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`phone_template_id\` int NOT NULL,
                \`yemot_campaign_id\` varchar(255) NULL,
                \`status\` varchar(50) NOT NULL DEFAULT 'pending',
                \`total_phones\` int NOT NULL DEFAULT 0,
                \`successful_calls\` int NOT NULL DEFAULT 0,
                \`failed_calls\` int NOT NULL DEFAULT 0,
                \`phone_numbers\` text NOT NULL,
                \`error_message\` text NULL,
                \`completed_at\` datetime NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`phone_campaign_user_id_idx\` (\`user_id\`),
                INDEX \`phone_campaign_template_id_idx\` (\`phone_template_id\`),
                INDEX \`phone_campaign_status_idx\` (\`status\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`phone_campaigns\``);
        await queryRunner.query(`DROP TABLE \`phone_templates\``);
    }
}
