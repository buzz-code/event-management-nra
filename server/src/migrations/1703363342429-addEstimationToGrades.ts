import { MigrationInterface, QueryRunner } from "typeorm";

export class addEstimationToGrades1703363342429 implements MigrationInterface {
    name = 'addEstimationToGrades1703363342429'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`grades\`
            ADD \`estimation\` varchar(500) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`grades\` DROP COLUMN \`estimation\`
        `);
    }

}
