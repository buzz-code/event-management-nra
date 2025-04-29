import { MigrationInterface, QueryRunner } from "typeorm";

export class addTeacherInKlassTypeTable1694450301604 implements MigrationInterface {
    name = 'addTeacherInKlassTypeTable1694450301604'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klass_types\`
            ADD \`teacher_id\` varchar(10) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`klass_types\`
            ADD \`teacherReferenceId\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klass_types\` DROP COLUMN \`teacherReferenceId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`klass_types\` DROP COLUMN \`teacher_id\`
        `);
    }

}
