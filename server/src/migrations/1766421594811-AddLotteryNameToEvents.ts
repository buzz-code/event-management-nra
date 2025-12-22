import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLotteryNameToEvents1766421594811 implements MigrationInterface {
    name = 'AddLotteryNameToEvents1766421594811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`lotteryName\` varchar(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`lotteryName\`
        `);
    }

}
