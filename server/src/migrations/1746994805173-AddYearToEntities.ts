import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddYearToEntities1746994805173 implements MigrationInterface {
  name = 'AddYearToEntities1746994805173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`event_types\`
            ADD \`year\` int NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`year\` int NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`gifts\`
            ADD \`year\` int NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD \`year\` int NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`level_types\`
            ADD \`year\` int NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`year\` int NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`year\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`level_types\` DROP COLUMN \`year\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP COLUMN \`year\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`gifts\` DROP COLUMN \`year\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`year\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`event_types\` DROP COLUMN \`year\`
        `);
  }
}
