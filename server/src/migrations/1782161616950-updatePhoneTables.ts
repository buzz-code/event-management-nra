import { MigrationInterface, QueryRunner } from "typeorm";

export class updatePhoneTables1782161616950 implements MigrationInterface {
    name = 'updatePhoneTables1782161616950'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP FOREIGN KEY \`FK_85e2bf6d6526694804f1f45c625\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP FOREIGN KEY \`FK_35d8a16bea2d214e5af97879e5c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP FOREIGN KEY \`FK_d8db42aa2d13d7c635793212dad\`
        `);
        await queryRunner.query(`
            DROP INDEX \`phone_template_user_id_idx\` ON \`phone_templates\`
        `);
        await queryRunner.query(`
            DROP INDEX \`phone_campaign_template_id_idx\` ON \`phone_campaigns\`
        `);
        await queryRunner.query(`
            DROP INDEX \`phone_campaign_user_id_idx\` ON \`phone_campaigns\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`userId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`yemotTemplateId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`messageType\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`messageText\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`isActive\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`callerId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`userId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`phoneTemplateId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`yemotCampaignId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`totalPhones\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`successfulCalls\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`failedCalls\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`phoneNumbers\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`errorMessage\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`completedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`user_id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`yemot_template_id\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`message_type\` varchar(50) NOT NULL DEFAULT 'text'
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`message_text\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`is_active\` tinyint NOT NULL DEFAULT 1
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`caller_id\` varchar(20) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`user_id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`phone_template_id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`yemot_campaign_id\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`total_phones\` int NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`successful_calls\` int NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`failed_calls\` int NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`phone_numbers\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`error_message\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`completed_at\` datetime NULL
        `);
        await queryRunner.query(`
            DROP INDEX \`events_student_user_date_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_event_date_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`eventDate\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`eventDate\` date NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`completionReportDate\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`completionReportDate\` date NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`phone_template_user_id_idx\` ON \`phone_templates\` (\`user_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`phone_campaign_user_id_idx\` ON \`phone_campaigns\` (\`user_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`phone_campaign_template_id_idx\` ON \`phone_campaigns\` (\`phone_template_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`events_student_user_date_idx\` ON \`events\` (
                \`studentReferenceId\`,
                \`user_id\`,
                \`eventDate\`,
                \`id\`
            )
        `);
        await queryRunner.query(`
            CREATE INDEX \`events_event_date_idx\` ON \`events\` (\`eventDate\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`events_event_date_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_student_user_date_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`phone_campaign_template_id_idx\` ON \`phone_campaigns\`
        `);
        await queryRunner.query(`
            DROP INDEX \`phone_campaign_user_id_idx\` ON \`phone_campaigns\`
        `);
        await queryRunner.query(`
            DROP INDEX \`phone_template_user_id_idx\` ON \`phone_templates\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`completionReportDate\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`completionReportDate\` datetime NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`eventDate\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`eventDate\` datetime NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`events_event_date_idx\` ON \`events\` (\`eventDate\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`events_student_user_date_idx\` ON \`events\` (
                \`studentReferenceId\`,
                \`user_id\`,
                \`eventDate\`,
                \`id\`
            )
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`completed_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`error_message\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`phone_numbers\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`failed_calls\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`successful_calls\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`total_phones\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`yemot_campaign_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`phone_template_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\` DROP COLUMN \`user_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`caller_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`is_active\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`message_text\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`message_type\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`yemot_template_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\` DROP COLUMN \`user_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`completedAt\` datetime NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`errorMessage\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`phoneNumbers\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`failedCalls\` int NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`successfulCalls\` int NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`totalPhones\` int NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`yemotCampaignId\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`phoneTemplateId\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD \`userId\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`callerId\` varchar(20) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`isActive\` tinyint NOT NULL DEFAULT '1'
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`messageText\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`messageType\` varchar(50) NOT NULL DEFAULT 'text'
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`yemotTemplateId\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD \`userId\` int NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`phone_campaign_user_id_idx\` ON \`phone_campaigns\` (\`userId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`phone_campaign_template_id_idx\` ON \`phone_campaigns\` (\`phoneTemplateId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`phone_template_user_id_idx\` ON \`phone_templates\` (\`userId\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD CONSTRAINT \`FK_d8db42aa2d13d7c635793212dad\` FOREIGN KEY (\`phoneTemplateId\`) REFERENCES \`phone_templates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_campaigns\`
            ADD CONSTRAINT \`FK_35d8a16bea2d214e5af97879e5c\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`phone_templates\`
            ADD CONSTRAINT \`FK_85e2bf6d6526694804f1f45c625\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
