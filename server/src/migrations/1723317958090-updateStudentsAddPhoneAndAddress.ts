import { MigrationInterface, QueryRunner } from "typeorm";

export class updateStudentsAddPhoneAndAddress1723317958090 implements MigrationInterface {
    name = 'updateStudentsAddPhoneAndAddress1723317958090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`phone\` varchar(1000) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`address\` varchar(1000) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`address\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`phone\`
        `);
    }

}
