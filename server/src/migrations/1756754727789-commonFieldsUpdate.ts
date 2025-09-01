import { MigrationInterface, QueryRunner } from "typeorm";

export class commonFieldsUpdate1756754727789 implements MigrationInterface {
    name = 'commonFieldsUpdate1756754727789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`texts\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_839f8cfeea5757c419a69a7ea34\` FOREIGN KEY (\`studentReferenceId\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_1375571a7df823cd26725623906\` FOREIGN KEY (\`studentClassReferenceId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_1375571a7df823cd26725623906\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_839f8cfeea5757c419a69a7ea34\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\` CHANGE \`updated_at\` \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\` CHANGE \`created_at\` \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
    }

}
