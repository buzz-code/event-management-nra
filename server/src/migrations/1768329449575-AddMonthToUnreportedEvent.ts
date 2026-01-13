import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMonthToUnreportedEvent1768329449575 implements MigrationInterface {
    name = 'AddMonthToUnreportedEvent1768329449575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\`
            ADD \`eventMonth\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\` DROP COLUMN \`eventMonth\`
        `);
    }

}
