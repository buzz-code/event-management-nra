import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateEntityNoteCascade1747761548735 implements MigrationInterface {
    name = 'UpdateEntityNoteCascade1747761548735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP FOREIGN KEY \`FK_11b8178349b9da9e78b5ebca677\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD CONSTRAINT \`FK_11b8178349b9da9e78b5ebca677\` FOREIGN KEY (\`eventReferenceId\`) REFERENCES \`events\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP FOREIGN KEY \`FK_11b8178349b9da9e78b5ebca677\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD CONSTRAINT \`FK_11b8178349b9da9e78b5ebca677\` FOREIGN KEY (\`eventReferenceId\`) REFERENCES \`events\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
