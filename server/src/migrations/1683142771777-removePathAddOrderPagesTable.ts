import { MigrationInterface, QueryRunner } from "typeorm";

export class removePathAddOrderPagesTable1683142771777 implements MigrationInterface {
    name = 'removePathAddOrderPagesTable1683142771777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`page\` CHANGE \`path\` \`order\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`page\` DROP COLUMN \`order\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`page\`
            ADD \`order\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`page\` DROP COLUMN \`order\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`page\`
            ADD \`order\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`page\` CHANGE \`order\` \`path\` varchar(255) NOT NULL
        `);
    }

}
