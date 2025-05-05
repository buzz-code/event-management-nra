import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdToEntities1746422737971 implements MigrationInterface {
    name = 'AddUserIdToEntities1746422737971'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add user_id columns
        await queryRunner.query(`
            ALTER TABLE \`event_types\`
            ADD \`user_id\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD \`user_id\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\`
            ADD \`user_id\` int NULL
        `);

        // Set default value of 1 for existing records
        await queryRunner.query(`
            UPDATE \`event_types\` SET \`user_id\` = 1 WHERE \`user_id\` IS NULL
        `);
        await queryRunner.query(`
            UPDATE \`event_gifts\` SET \`user_id\` = 1 WHERE \`user_id\` IS NULL
        `);
        await queryRunner.query(`
            UPDATE \`gifts\` SET \`user_id\` = 1 WHERE \`user_id\` IS NULL
        `);

        // Modify columns to make them NOT NULL after data is migrated
        await queryRunner.query(`
            ALTER TABLE \`event_types\` MODIFY \`user_id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` MODIFY \`user_id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\` MODIFY \`user_id\` int NOT NULL
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX \`event_types_user_id_idx\` ON \`event_types\` (\`user_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`event_gifts_user_id_idx\` ON \`event_gifts\` (\`user_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`gifts_user_id_idx\` ON \`gifts\` (\`user_id\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`
            DROP INDEX \`gifts_user_id_idx\` ON \`gifts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`event_gifts_user_id_idx\` ON \`event_gifts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`event_types_user_id_idx\` ON \`event_types\`
        `);
        
        // Drop columns
        await queryRunner.query(`
            ALTER TABLE \`gifts\` DROP COLUMN \`user_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP COLUMN \`user_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\` DROP COLUMN \`user_id\`
        `);
    }
}
