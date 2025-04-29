import { MigrationInterface, QueryRunner } from "typeorm";

export class makeAttReportAbsDecimal1700683658614 implements MigrationInterface {
    name = 'makeAttReportAbsDecimal1700683658614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`abs_count\` \`abs_count\` float NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`approved_abs_count\` \`approved_abs_count\` float NOT NULL DEFAULT '0'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`approved_abs_count\` \`approved_abs_count\` int NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`att_reports\` CHANGE \`abs_count\` \`abs_count\` int NOT NULL DEFAULT '0'
        `);
    }

}
