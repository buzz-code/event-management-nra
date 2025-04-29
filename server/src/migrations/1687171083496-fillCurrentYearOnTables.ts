import { MigrationInterface, QueryRunner } from "typeorm"

export class fillCurrentYearOnTables1687171083496 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            update att_reports
            set year = 5783
            where year is null or year = 0
        `);
        await queryRunner.query(`
            update grades
            set year = 5783
            where year is null or year = 0
        `);
        await queryRunner.query(`
            update lessons
            set year = 5783
            where year is null or year = 0
        `);
        await queryRunner.query(`
            update student_klasses
            set year = 5783
            where year is null or year = 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
