import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateStudentNameField1746991089735 implements MigrationInterface {
  name = 'UpdateStudentNameField1746991089735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`students_full_name_idx\` ON \`students\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`firstName\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`lastName\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\` CHANGE \`name\` \`name\` varchar(510) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`students\` CHANGE \`name\` \`name\` varchar(510) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`lastName\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`firstName\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            CREATE INDEX \`students_full_name_idx\` ON \`students\` (\`firstName\`, \`lastName\`)
        `);
  }
}
