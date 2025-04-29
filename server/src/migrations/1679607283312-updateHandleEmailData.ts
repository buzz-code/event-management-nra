import { MigrationInterface, QueryRunner } from "typeorm";

export class updateHandleEmailData1679607283312 implements MigrationInterface {
    name = 'updateHandleEmailData1679607283312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\` DROP COLUMN \`subject\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\`
            ADD \`subject\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\` DROP COLUMN \`body\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\`
            ADD \`body\` text NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\` DROP COLUMN \`body\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\`
            ADD \`body\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\` DROP COLUMN \`subject\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`recieved_mail\`
            ADD \`subject\` varchar(255) NOT NULL
        `);
    }

}
