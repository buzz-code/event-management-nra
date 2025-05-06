import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEmptyTeacherNames1714988520000 implements MigrationInterface {
    name = 'UpdateEmptyTeacherNames1714988520000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if the teacher and user tables exist
        const tablesResult = await queryRunner.query(
            `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
             WHERE TABLE_SCHEMA = schema() AND TABLE_NAME IN ('teachers', 'users')`
        );
        
        const tableNames = tablesResult.map(t => t.TABLE_NAME);
        
        // Continue only if both tables exist
        if (tableNames.includes('teachers') && tableNames.includes('users')) {
            // Query teachers with empty names and update with ownUser name
            await queryRunner.query(`
                UPDATE teachers t
                JOIN users u ON t.own_user_id = u.id
                SET t.name = u.name
                WHERE t.name = '' OR t.name IS NULL;
            `);
            
            // Log the update
            console.log('Updated teachers with empty names using their associated ownUser names.');
        } else {
            console.log('Teachers or Users table not found, skipping migration.');
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // This migration cannot be reverted as it populates empty fields with data
        // No action needed in the down method
        console.log('No reversion needed for update of empty teacher names.');
    }
}