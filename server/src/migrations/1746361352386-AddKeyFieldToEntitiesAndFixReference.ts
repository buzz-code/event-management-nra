import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKeyFieldToEntitiesAndFixReference1746361352386 implements MigrationInterface {
    name = 'AddKeyFieldToEntitiesAndFixReference1746361352386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`authorId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`eventId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP COLUMN \`eventId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP COLUMN \`giftId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`studentId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`teacherId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`tz\` varchar(9) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD \`giftKey\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`teacherTz\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`studentTz\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\`
            ADD \`key\` int NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`classes\` DROP COLUMN \`key\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`studentTz\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`teacherTz\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP COLUMN \`giftKey\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`tz\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`teacherId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`studentId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD \`giftId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD \`eventId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`eventId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`authorId\` int NULL
        `);
    }

}
