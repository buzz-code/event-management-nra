import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUnreportedEventDate1764088093206 implements MigrationInterface {
    name = 'DropUnreportedEventDate1764088093206'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\` DROP COLUMN \`eventDate\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\` DROP COLUMN \`eventHebrewDate\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\` DROP COLUMN \`eventHebrewMonth\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\`
            ADD \`eventHebrewMonth\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\`
            ADD \`eventHebrewDate\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\`
            ADD \`eventDate\` datetime NOT NULL
        `);
    }

}
