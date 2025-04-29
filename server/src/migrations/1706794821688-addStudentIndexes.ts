import { MigrationInterface, QueryRunner } from "typeorm";

export class addStudentIndexes1706794821688 implements MigrationInterface {
    name = 'addStudentIndexes1706794821688'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX \`IDX_a7a9761c4d14939ffa38598ee8\` ON \`student_klasses\` (\`studentReferenceId\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_cf652cc96dec2b051bc0f2f589\` ON \`known_absences\` (\`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_f2e0b7295d97b24618d46079c1\` ON \`known_absences\` (\`studentReferenceId\`, \`year\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_f2e0b7295d97b24618d46079c1\` ON \`known_absences\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_cf652cc96dec2b051bc0f2f589\` ON \`known_absences\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a7a9761c4d14939ffa38598ee8\` ON \`student_klasses\`
        `);
    }

}
