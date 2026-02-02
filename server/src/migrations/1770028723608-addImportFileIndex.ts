import { MigrationInterface, QueryRunner } from "typeorm";

export class addImportFileIndex1770028723608 implements MigrationInterface {
    name = 'addImportFileIndex1770028723608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX \`import_file_user_id_idx\` ON \`import_file\` (\`userId\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`import_file_user_id_idx\` ON \`import_file\`
        `);
    }

}
