import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFamilyStatusType1756755424330 implements MigrationInterface {
    name = 'AddFamilyStatusType1756755424330'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`family_status_types\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`key\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`family_status_types_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`familyStatusKey\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`family_status_reference_id\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`family_status_reference_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`familyStatusKey\`
        `);
        await queryRunner.query(`
            DROP INDEX \`family_status_types_user_id_idx\` ON \`family_status_types\`
        `);
        await queryRunner.query(`
            DROP TABLE \`family_status_types\`
        `);
    }

}
