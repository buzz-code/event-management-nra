import { MigrationInterface, QueryRunner } from "typeorm";

export class TeacherSingleNameField1714986520000 implements MigrationInterface {
    name = 'TeacherSingleNameField1714986520000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Get database name from connection
        const dbName = queryRunner.connection.options.database?.toString() || 'event_management_nra';
        
        // Get current columns in teachers table
        const columnsResult = await queryRunner.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = '${dbName}' AND TABLE_NAME = 'teachers'`
        );
        const columnNames = columnsResult.map(c => c.COLUMN_NAME);
        
        // Add name column if it doesn't exist
        if (!columnNames.includes('name')) {
            await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`name\` varchar(255) NOT NULL DEFAULT ''`);
            
            // If both firstName and lastName exist, populate name with concatenated values
            if (columnNames.includes('first_name') && columnNames.includes('last_name')) {
                await queryRunner.query(
                    `UPDATE \`teachers\` SET \`name\` = CONCAT(
                        IFNULL(\`first_name\`, ''), 
                        IF(\`first_name\` IS NOT NULL AND \`last_name\` IS NOT NULL, ' ', ''),
                        IFNULL(\`last_name\`, '')
                    )`
                );
            }
        }
        
        // Create index on name column if it doesn't exist
        const indexesResult = await queryRunner.query(
            `SHOW INDEX FROM \`teachers\` WHERE Key_name = 'teachers_name_idx'`
        );
        if (indexesResult.length === 0) {
            await queryRunner.query(`CREATE INDEX \`teachers_name_idx\` ON \`teachers\` (\`name\`)`);
        }
        
        // Check and drop first_name indexes if they exist
        if (columnNames.includes('first_name')) {
            const firstNameIndexResult = await queryRunner.query(
                `SHOW INDEX FROM \`teachers\` WHERE Key_name = 'teachers_first_name_idx'`
            );
            if (firstNameIndexResult.length > 0) {
                await queryRunner.query(`DROP INDEX \`teachers_first_name_idx\` ON \`teachers\``);
            }
        }
        
        // Check and drop last_name indexes if they exist
        if (columnNames.includes('last_name')) {
            const lastNameIndexResult = await queryRunner.query(
                `SHOW INDEX FROM \`teachers\` WHERE Key_name = 'teachers_last_name_idx'`
            );
            if (lastNameIndexResult.length > 0) {
                await queryRunner.query(`DROP INDEX \`teachers_last_name_idx\` ON \`teachers\``);
            }
        }
        
        // Drop the old columns if they exist
        if (columnNames.includes('first_name')) {
            await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`first_name\``);
        }
        
        if (columnNames.includes('last_name')) {
            await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`last_name\``);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Get database name from connection
        const dbName = queryRunner.connection.options.database?.toString() || 'event_management_nra';
        
        // Get current columns in teachers table
        const columnsResult = await queryRunner.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
             WHERE TABLE_SCHEMA = '${dbName}' AND TABLE_NAME = 'teachers'`
        );
        const columnNames = columnsResult.map(c => c.COLUMN_NAME);
        
        // Recreate the firstName and lastName columns if they don't exist
        if (!columnNames.includes('first_name')) {
            await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`first_name\` varchar(255) NOT NULL DEFAULT ''`);
        }
        
        if (!columnNames.includes('last_name')) {
            await queryRunner.query(`ALTER TABLE \`teachers\` ADD \`last_name\` varchar(255) NOT NULL DEFAULT ''`);
        }
        
        // Split name into firstName and lastName if name exists
        if (columnNames.includes('name')) {
            await queryRunner.query(`
                UPDATE \`teachers\` 
                SET 
                    \`first_name\` = SUBSTRING_INDEX(\`name\`, ' ', 1),
                    \`last_name\` = IF(LOCATE(' ', \`name\`) > 0, SUBSTRING(\`name\`, LOCATE(' ', \`name\`) + 1), '')
            `);
        }
        
        // Create the original indexes if they don't exist
        const firstNameIndexResult = await queryRunner.query(
            `SHOW INDEX FROM \`teachers\` WHERE Key_name = 'teachers_first_name_idx'`
        );
        if (firstNameIndexResult.length === 0) {
            await queryRunner.query(`CREATE INDEX \`teachers_first_name_idx\` ON \`teachers\` (\`first_name\`)`);
        }
        
        const lastNameIndexResult = await queryRunner.query(
            `SHOW INDEX FROM \`teachers\` WHERE Key_name = 'teachers_last_name_idx'`
        );
        if (lastNameIndexResult.length === 0) {
            await queryRunner.query(`CREATE INDEX \`teachers_last_name_idx\` ON \`teachers\` (\`last_name\`)`);
        }
        
        // Drop the name column and index if they exist
        const nameIndexResult = await queryRunner.query(
            `SHOW INDEX FROM \`teachers\` WHERE Key_name = 'teachers_name_idx'`
        );
        if (nameIndexResult.length > 0) {
            await queryRunner.query(`DROP INDEX \`teachers_name_idx\` ON \`teachers\``);
        }
        
        if (columnNames.includes('name')) {
            await queryRunner.query(`ALTER TABLE \`teachers\` DROP COLUMN \`name\``);
        }
    }
}