import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventReporterStudent1771707688217 implements MigrationInterface {
    name = 'AddEventReporterStudent1771707688217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`reporterStudentTz\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`reporterStudentReferenceId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_0dc68e9b62ca7e8fa8e49bb173d\` FOREIGN KEY (\`reporterStudentReferenceId\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_0dc68e9b62ca7e8fa8e49bb173d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`reporterStudentReferenceId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`reporterStudentTz\`
        `);
    }

}
