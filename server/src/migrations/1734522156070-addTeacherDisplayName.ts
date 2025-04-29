import { MigrationInterface, QueryRunner } from "typeorm";

export class addTeacherDisplayName1734522156070 implements MigrationInterface {
    name = 'addTeacherDisplayName1734522156070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`displayName\` varchar(500) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`displayName\`
        `);
    }

}
