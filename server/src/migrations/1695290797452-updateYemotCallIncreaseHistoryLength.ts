import { MigrationInterface, QueryRunner } from "typeorm";

export class updateYemotCallIncreaseHistoryLength1695290797452 implements MigrationInterface {
    name = 'updateYemotCallIncreaseHistoryLength1695290797452'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`yemot_call\` MODIFY COLUMN \`history\` mediumtext NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`yemot_call\` MODIFY COLUMN \`history\` text NOT NULL
        `);
    }

}
