import { MigrationInterface, QueryRunner } from "typeorm";

export class adColumnsToKnownAbsences1698821603832 implements MigrationInterface {
    name = 'adColumnsToKnownAbsences1698821603832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`known_absences\`
            ADD \`klass_id\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\`
            ADD \`klassReferenceId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\`
            ADD \`lesson_id\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\`
            ADD \`lessonReferenceId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\`
            ADD \`isApproved\` tinyint NOT NULL DEFAULT 1
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` DROP COLUMN \`isApproved\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` DROP COLUMN \`lessonReferenceId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` DROP COLUMN \`lesson_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` DROP COLUMN \`klassReferenceId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` DROP COLUMN \`klass_id\`
        `);
    }

}
