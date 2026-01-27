import { MigrationInterface, QueryRunner } from "typeorm";

export class updateImportFileMetadata1769505745772 implements MigrationInterface {
    name = 'updateImportFileMetadata1769505745772'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\` DROP COLUMN \`metadata\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`import_file\`
            ADD \`metadata\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\` DROP COLUMN \`metadata\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`import_file\`
            ADD \`metadata\` json NULL
        `);
    }

}
