import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeStudentTzUnique1747251226379 implements MigrationInterface {
  name = 'MakeStudentTzUnique1747251226379';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`students_tz_idx\` ON \`students\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\` CHANGE \`tz\` \`tz\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX \`students_tz_idx\` ON \`students\` (\`tz\`)
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_792054225739143030d210a629\` ON \`students\` (\`user_id\`, \`tz\`)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_792054225739143030d210a629\` ON \`students\`
        `);
    await queryRunner.query(`
            DROP INDEX \`students_tz_idx\` ON \`students\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\` CHANGE \`tz\` \`tz\` varchar(255) NULL
        `);
    await queryRunner.query(`
            CREATE INDEX \`students_tz_idx\` ON \`students\` (\`tz\`)
        `);
  }
}
