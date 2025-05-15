import { MigrationInterface, QueryRunner } from 'typeorm';

export class SetDefaultYear1747036081078 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE \`events\` SET \`year\` = 5785 WHERE \`year\` IS NULL`);
    await queryRunner.query(`UPDATE \`event_gifts\` SET \`year\` = 5785 WHERE \`year\` IS NULL`);
    await queryRunner.query(`UPDATE \`event_notes\` SET \`year\` = 5785 WHERE \`year\` IS NULL`);
    await queryRunner.query(`UPDATE \`event_types\` SET \`year\` = 5785 WHERE \`year\` IS NULL`);
    await queryRunner.query(`UPDATE \`gifts\` SET \`year\` = 5785 WHERE \`year\` IS NULL`);
    await queryRunner.query(`UPDATE \`level_types\` SET \`year\` = 5785 WHERE \`year\` IS NULL`);
    await queryRunner.query(`UPDATE \`student_classes\` SET \`year\` = 5785 WHERE \`year\` IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // It's not possible to know the previous value of the year field, so we can't revert this migration.
  }
}
