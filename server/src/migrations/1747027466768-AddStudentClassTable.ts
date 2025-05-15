import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStudentClassTable1747027466768 implements MigrationInterface {
  name = 'AddStudentClassTable1747027466768';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`student_classes\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`year\` int NULL,
                \`studentTz\` varchar(255) NULL,
                \`studentReferenceId\` int NULL,
                \`classKey\` int NULL,
                \`classReferenceId\` int NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`student_classes_class_idx\` (\`classReferenceId\`),
                INDEX \`student_classes_student_idx\` (\`studentReferenceId\`),
                INDEX \`student_classes_user_id_idx\` (\`user_id\`),
                UNIQUE INDEX \`IDX_1a74fabb33731a4f123b7671f9\` (\`studentReferenceId\`, \`classReferenceId\`, \`year\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`student_classes\`
            ADD CONSTRAINT \`FK_64129dca85e1aa49a277dce81d5\` FOREIGN KEY (\`studentReferenceId\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`student_classes\`
            ADD CONSTRAINT \`FK_1d2537916600593353f8a79363e\` FOREIGN KEY (\`classReferenceId\`) REFERENCES \`classes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`student_classes\` DROP FOREIGN KEY \`FK_1d2537916600593353f8a79363e\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`student_classes\` DROP FOREIGN KEY \`FK_64129dca85e1aa49a277dce81d5\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_1a74fabb33731a4f123b7671f9\` ON \`student_classes\`
        `);
    await queryRunner.query(`
            DROP INDEX \`student_classes_user_id_idx\` ON \`student_classes\`
        `);
    await queryRunner.query(`
            DROP INDEX \`student_classes_student_idx\` ON \`student_classes\`
        `);
    await queryRunner.query(`
            DROP INDEX \`student_classes_class_idx\` ON \`student_classes\`
        `);
    await queryRunner.query(`
            DROP TABLE \`student_classes\`
        `);
  }
}
