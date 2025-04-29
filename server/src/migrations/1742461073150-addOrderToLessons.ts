import { MigrationInterface, QueryRunner } from "typeorm";

export class addOrderToLessons1742461073150 implements MigrationInterface {
    name = 'addOrderToLessons1742461073150'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lessons\`
            ADD \`order\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lessons\` DROP COLUMN \`order\`
        `);
    }

}
