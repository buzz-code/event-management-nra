import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToEventNote1746423312915 implements MigrationInterface {
    name = 'AddUserIdToEventNote1746423312915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add user_id column as nullable first
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`user_id\` int NULL
        `);

        // Set default value of 1 for existing records
        await queryRunner.query(`
            UPDATE \`event_notes\` SET \`user_id\` = 1 WHERE \`user_id\` IS NULL
        `);

        // Modify column to make it NOT NULL after data is migrated
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` MODIFY \`user_id\` int NOT NULL
        `);

        // Create index
        await queryRunner.query(`
            CREATE INDEX \`event_notes_user_id_idx\` ON \`event_notes\` (\`user_id\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`event_notes_user_id_idx\` ON \`event_notes\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`user_id\`
        `);
    }
}
