import { MigrationInterface, QueryRunner } from 'typeorm';

export class addStudentAndEventFields1746772012503 implements MigrationInterface {
  name = 'addStudentAndEventFields1746772012503';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`motherPreviousName\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`eventHebrewDate\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`eventHebrewMonth\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`completedPathKey\` int NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`completedPathReferenceId\` int NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`completionReportDate\` datetime NULL
        `);
    await queryRunner.query(`
            CREATE INDEX \`events_event_hebrew_month_idx\` ON \`events\` (\`eventHebrewMonth\`)
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_8fb4246e6783cba11993ad545be\` FOREIGN KEY (\`completedPathReferenceId\`) REFERENCES \`level_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_8fb4246e6783cba11993ad545be\`
        `);
    await queryRunner.query(`
            DROP INDEX \`events_event_hebrew_month_idx\` ON \`events\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`completionReportDate\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`completedPathReferenceId\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`completedPathKey\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`eventHebrewMonth\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`eventHebrewDate\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`motherPreviousName\`
        `);
  }
}
