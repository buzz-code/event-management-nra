import { MigrationInterface, QueryRunner } from "typeorm";

export class addImportFileMetadata1768855443723 implements MigrationInterface {
    name = 'addImportFileMetadata1768855443723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\`
            ADD \`metadata\` json NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\` DROP COLUMN \`metadata\`
        `);
    }

}
