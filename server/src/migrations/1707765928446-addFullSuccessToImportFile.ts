import { MigrationInterface, QueryRunner } from "typeorm";

export class addFullSuccessToImportFile1707765928446 implements MigrationInterface {
    name = 'addFullSuccessToImportFile1707765928446'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\`
            ADD \`fullSuccess\` tinyint NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`grades\` DROP COLUMN \`grade\`
        `);
    }

}
