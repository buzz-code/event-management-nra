import { MigrationInterface, QueryRunner } from "typeorm";

export class addIsRevertedToAuditLog1727331114248 implements MigrationInterface {
    name = 'addIsRevertedToAuditLog1727331114248'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`audit_log\`
            ADD \`isReverted\` tinyint NOT NULL DEFAULT 0
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`audit_log\` DROP COLUMN \`isReverted\`
        `);
    }

}
