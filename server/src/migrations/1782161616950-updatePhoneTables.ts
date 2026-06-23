import { MigrationInterface, QueryRunner } from "typeorm";

export class updatePhoneTables1782161616950 implements MigrationInterface {
    name = 'updatePhoneTables1782161616950'

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Check if a column exists in the current database */
    private async columnExists(
        queryRunner: QueryRunner,
        table: string,
        column: string,
    ): Promise<boolean> {
        const result = await queryRunner.query(
            `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
            [table, column],
        );
        return Number(result[0]?.cnt) > 0;
    }

    /**
     * Rename an existing column to a new name+type, OR add the new column if
     * the old one doesn't exist (partial-run scenario), OR skip if the new
     * column already exists.
     */
    private async renameOrAddColumn(
        queryRunner: QueryRunner,
        table: string,
        oldColumn: string,
        newColumn: string,
        definition: string,
    ): Promise<void> {
        const newExists = await this.columnExists(queryRunner, table, newColumn);
        if (newExists) return; // already done (partial run)

        const oldExists = await this.columnExists(queryRunner, table, oldColumn);
        if (oldExists) {
            // Old column still exists → rename + retype in-place
            await queryRunner.query(
                `ALTER TABLE \`${table}\` CHANGE COLUMN \`${oldColumn}\` \`${newColumn}\` ${definition}`,
            );
        } else {
            // Neither exists → add fresh
            await queryRunner.query(
                `ALTER TABLE \`${table}\` ADD COLUMN \`${newColumn}\` ${definition}`,
            );
        }
    }

    /** Check if an index exists */
    private async indexExists(
        queryRunner: QueryRunner,
        table: string,
        indexName: string,
    ): Promise<boolean> {
        const result = await queryRunner.query(
            `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.STATISTICS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
            [table, indexName],
        );
        return Number(result[0]?.cnt) > 0;
    }

    /** Create index only if it doesn't already exist */
    private async createIndexIfMissing(
        queryRunner: QueryRunner,
        indexName: string,
        table: string,
        columns: string,
    ): Promise<void> {
        const exists = await this.indexExists(queryRunner, table, indexName);
        if (exists) return;
        await queryRunner.query(
            `CREATE INDEX \`${indexName}\` ON \`${table}\` (${columns})`,
        );
    }

    /** Drop index only if it exists */
    private async dropIndexIfExists(
        queryRunner: QueryRunner,
        indexName: string,
        table: string,
    ): Promise<void> {
        const exists = await this.indexExists(queryRunner, table, indexName);
        if (!exists) return;
        await queryRunner.query(`DROP INDEX \`${indexName}\` ON \`${table}\``);
    }

    /** Drop foreign key only if it exists */
    private async dropForeignKeyIfExists(
        queryRunner: QueryRunner,
        table: string,
        fkName: string,
    ): Promise<void> {
        const result = await queryRunner.query(
            `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
             AND CONSTRAINT_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
            [table, fkName],
        );
        if (Number(result[0]?.cnt) === 0) return;
        await queryRunner.query(
            `ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fkName}\``,
        );
    }

    /** Add foreign key only if it doesn't already exist */
    private async addForeignKeyIfMissing(
        queryRunner: QueryRunner,
        table: string,
        fkName: string,
        column: string,
        refTable: string,
        refColumn: string,
    ): Promise<void> {
        const result = await queryRunner.query(
            `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
             AND CONSTRAINT_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
            [table, fkName],
        );
        if (Number(result[0]?.cnt) > 0) return; // already exists
        await queryRunner.query(
            `ALTER TABLE \`${table}\` ADD CONSTRAINT \`${fkName}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${refTable}\`(\`${refColumn}\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    // ── UP ────────────────────────────────────────────────────────────────────

    public async up(queryRunner: QueryRunner): Promise<void> {
        // --- Drop old foreign keys (if they exist) ---
        await this.dropForeignKeyIfExists(queryRunner, 'phone_templates', 'FK_85e2bf6d6526694804f1f45c625');
        await this.dropForeignKeyIfExists(queryRunner, 'phone_campaigns', 'FK_35d8a16bea2d214e5af97879e5c');
        await this.dropForeignKeyIfExists(queryRunner, 'phone_campaigns', 'FK_d8db42aa2d13d7c635793212dad');

        // --- Drop old indexes (if they exist) ---
        await this.dropIndexIfExists(queryRunner, 'phone_template_user_id_idx', 'phone_templates');
        await this.dropIndexIfExists(queryRunner, 'phone_campaign_template_id_idx', 'phone_campaigns');
        await this.dropIndexIfExists(queryRunner, 'phone_campaign_user_id_idx', 'phone_campaigns');

        // --- Rename old camelCase columns → new snake_case columns ---
        // If old column exists: CHANGE COLUMN (rename + retype in-place, preserves data)
        // If old column doesn't exist: ADD COLUMN (fresh, for partial-run scenario)
        // If new column already exists: skip entirely

        // phone_templates
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'userId', 'user_id', 'int NOT NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'yemotTemplateId', 'yemot_template_id', 'varchar(255) NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'messageType', 'message_type', `varchar(50) NOT NULL DEFAULT 'text'`);
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'messageText', 'message_text', 'text NOT NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'isActive', 'is_active', `tinyint NOT NULL DEFAULT 1`);
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'callerId', 'caller_id', 'varchar(20) NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'createdAt', 'created_at', 'timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'updatedAt', 'updated_at', 'timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)');

        // phone_campaigns
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'userId', 'user_id', 'int NOT NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'phoneTemplateId', 'phone_template_id', 'int NOT NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'yemotCampaignId', 'yemot_campaign_id', 'varchar(255) NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'totalPhones', 'total_phones', `int NOT NULL DEFAULT '0'`);
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'successfulCalls', 'successful_calls', `int NOT NULL DEFAULT '0'`);
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'failedCalls', 'failed_calls', `int NOT NULL DEFAULT '0'`);
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'phoneNumbers', 'phone_numbers', 'text NOT NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'errorMessage', 'error_message', 'text NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'createdAt', 'created_at', 'timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'updatedAt', 'updated_at', 'timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'completedAt', 'completed_at', 'datetime NULL');

        // --- events: change eventDate from datetime → date, completionReportDate from datetime → date ---
        // Use MODIFY COLUMN (converts type in-place, preserves data)
        const eventDateExists = await this.columnExists(queryRunner, 'events', 'eventDate');
        if (eventDateExists) {
            await queryRunner.query(`ALTER TABLE \`events\` MODIFY COLUMN \`eventDate\` date NOT NULL`);
        }
        const completionReportDateExists = await this.columnExists(queryRunner, 'events', 'completionReportDate');
        if (completionReportDateExists) {
            await queryRunner.query(`ALTER TABLE \`events\` MODIFY COLUMN \`completionReportDate\` date NULL`);
        }

        // --- Drop old events indexes (if they exist, will recreate with new column types) ---
        await this.dropIndexIfExists(queryRunner, 'events_student_user_date_idx', 'events');
        await this.dropIndexIfExists(queryRunner, 'events_event_date_idx', 'events');

        // --- Create new indexes (if they don't exist) ---
        await this.createIndexIfMissing(queryRunner, 'phone_template_user_id_idx', 'phone_templates', '`user_id`');
        await this.createIndexIfMissing(queryRunner, 'phone_campaign_user_id_idx', 'phone_campaigns', '`user_id`');
        await this.createIndexIfMissing(queryRunner, 'phone_campaign_template_id_idx', 'phone_campaigns', '`phone_template_id`');
        await this.createIndexIfMissing(queryRunner, 'events_student_user_date_idx', 'events', '`studentReferenceId`, `user_id`, `eventDate`, `id`');
        await this.createIndexIfMissing(queryRunner, 'events_event_date_idx', 'events', '`eventDate`');
    }

    // ── DOWN ──────────────────────────────────────────────────────────────────

    public async down(queryRunner: QueryRunner): Promise<void> {
        // --- Drop new indexes ---
        await this.dropIndexIfExists(queryRunner, 'events_event_date_idx', 'events');
        await this.dropIndexIfExists(queryRunner, 'events_student_user_date_idx', 'events');
        await this.dropIndexIfExists(queryRunner, 'phone_campaign_template_id_idx', 'phone_campaigns');
        await this.dropIndexIfExists(queryRunner, 'phone_campaign_user_id_idx', 'phone_campaigns');
        await this.dropIndexIfExists(queryRunner, 'phone_template_user_id_idx', 'phone_templates');

        // --- Revert events column types: date → datetime ---
        const eventDateExists = await this.columnExists(queryRunner, 'events', 'eventDate');
        if (eventDateExists) {
            await queryRunner.query(`ALTER TABLE \`events\` MODIFY COLUMN \`eventDate\` datetime NOT NULL`);
        }
        const completionReportDateExists = await this.columnExists(queryRunner, 'events', 'completionReportDate');
        if (completionReportDateExists) {
            await queryRunner.query(`ALTER TABLE \`events\` MODIFY COLUMN \`completionReportDate\` datetime NULL`);
        }

        // --- Recreate old events indexes ---
        await this.createIndexIfMissing(queryRunner, 'events_event_date_idx', 'events', '`eventDate`');
        await this.createIndexIfMissing(queryRunner, 'events_student_user_date_idx', 'events', '`studentReferenceId`, `user_id`, `eventDate`, `id`');

        // --- Rename snake_case columns back to camelCase ---
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'completed_at', 'completedAt', 'datetime NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'updated_at', 'updatedAt', 'timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'created_at', 'createdAt', 'timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'error_message', 'errorMessage', 'text NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'phone_numbers', 'phoneNumbers', 'text NOT NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'failed_calls', 'failedCalls', `int NOT NULL DEFAULT '0'`);
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'successful_calls', 'successfulCalls', `int NOT NULL DEFAULT '0'`);
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'total_phones', 'totalPhones', `int NOT NULL DEFAULT '0'`);
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'yemot_campaign_id', 'yemotCampaignId', 'varchar(255) NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'phone_template_id', 'phoneTemplateId', 'int NOT NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_campaigns', 'user_id', 'userId', 'int NOT NULL');

        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'updated_at', 'updatedAt', 'timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'created_at', 'createdAt', 'timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'caller_id', 'callerId', 'varchar(20) NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'is_active', 'isActive', `tinyint NOT NULL DEFAULT '1'`);
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'message_text', 'messageText', 'text NOT NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'message_type', 'messageType', `varchar(50) NOT NULL DEFAULT 'text'`);
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'yemot_template_id', 'yemotTemplateId', 'varchar(255) NULL');
        await this.renameOrAddColumn(queryRunner, 'phone_templates', 'user_id', 'userId', 'int NOT NULL');

        // --- Recreate old indexes ---
        await this.createIndexIfMissing(queryRunner, 'phone_campaign_user_id_idx', 'phone_campaigns', '`userId`');
        await this.createIndexIfMissing(queryRunner, 'phone_campaign_template_id_idx', 'phone_campaigns', '`phoneTemplateId`');
        await this.createIndexIfMissing(queryRunner, 'phone_template_user_id_idx', 'phone_templates', '`userId`');

        // --- Recreate foreign keys (only if missing) ---
        await this.addForeignKeyIfMissing(queryRunner, 'phone_campaigns', 'FK_d8db42aa2d13d7c635793212dad', 'phoneTemplateId', 'phone_templates', 'id');
        await this.addForeignKeyIfMissing(queryRunner, 'phone_campaigns', 'FK_35d8a16bea2d214e5af97879e5c', 'userId', 'users', 'id');
        await this.addForeignKeyIfMissing(queryRunner, 'phone_templates', 'FK_85e2bf6d6526694804f1f45c625', 'userId', 'users', 'id');
    }

}