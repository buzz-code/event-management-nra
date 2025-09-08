import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFulfillmentQuestions1757365315565 implements MigrationInterface {
    name = 'AddFulfillmentQuestions1757365315565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion1\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion2\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion3\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion4\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion5\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion6\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion7\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion8\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion9\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion10\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`fulfillmentQuestion11\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion11\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion10\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion9\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion8\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion7\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion3\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion2\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`fulfillmentQuestion1\`
        `);
    }

}
