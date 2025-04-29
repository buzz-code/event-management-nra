import { MigrationInterface, QueryRunner } from "typeorm";

export class recievedMailNullableColumns1681588431337 implements MigrationInterface {
    name = 'recievedMailNullableColumns1681588431337'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\` CHANGE \`subject\` \`subject\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\` CHANGE \`body\` \`body\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\` CHANGE \`body\` \`body\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\` CHANGE \`subject\` \`subject\` text NOT NULL
        `);
    }

}
