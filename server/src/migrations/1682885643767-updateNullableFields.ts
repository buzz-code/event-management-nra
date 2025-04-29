import { MigrationInterface, QueryRunner } from "typeorm";

export class updateNullableFields1682885643767 implements MigrationInterface {
    name = 'updateNullableFields1682885643767'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`FK_9a2642196187f93e9fd8d20529e\` ON \`klasses\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`lessons\` CHANGE \`teacher_id\` \`teacher_id\` varchar(10) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`student_klasses\` CHANGE \`student_tz\` \`student_tz\` varchar(10) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`student_klasses\` CHANGE \`klass_id\` \`klass_id\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`student_tz\` \`student_tz\` varchar(10) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`teacher_id\` \`teacher_id\` varchar(10) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`lesson_id\` \`lesson_id\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`student_tz\` \`student_tz\` varchar(10) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`teacher_id\` \`teacher_id\` varchar(10) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`lesson_id\` \`lesson_id\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` CHANGE \`student_tz\` \`student_tz\` varchar(10) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`known_absences\` CHANGE \`student_tz\` \`student_tz\` varchar(10) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`lesson_id\` \`lesson_id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`teacher_id\` \`teacher_id\` varchar(10) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`grades\` CHANGE \`student_tz\` \`student_tz\` varchar(10) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`lesson_id\` \`lesson_id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`teacher_id\` \`teacher_id\` varchar(10) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`student_tz\` \`student_tz\` varchar(10) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`student_klasses\` CHANGE \`klass_id\` \`klass_id\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`student_klasses\` CHANGE \`student_tz\` \`student_tz\` varchar(10) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`lessons\` CHANGE \`teacher_id\` \`teacher_id\` varchar(10) NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`FK_9a2642196187f93e9fd8d20529e\` ON \`klasses\` (\`klassTypeReferenceId\`)
        `);
    }

}
