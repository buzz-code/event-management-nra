import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLotteryTrackToEvents1757664787921 implements MigrationInterface {
    name = 'AddLotteryTrackToEvents1757664787921'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`lotteryTrack\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`lotteryTrack\`
        `);
    }

}
