import { MigrationInterface, QueryRunner } from "typeorm";

export class updateDisplayNameNullable1743061002171 implements MigrationInterface {
    name = 'updateDisplayNameNullable1743061002171'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klasses\` CHANGE \`display_name\` \`display_name\` varchar(500) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`lessons\` CHANGE \`display_name\` \`display_name\` varchar(500) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lessons\` CHANGE \`display_name\` \`display_name\` varchar(500) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`klasses\` CHANGE \`display_name\` \`display_name\` varchar(500) NOT NULL
        `);
    }

}
