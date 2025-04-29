import { MigrationInterface, QueryRunner } from "typeorm";

export class addPageTable1682968919553 implements MigrationInterface {
    name = 'addPageTable1682968919553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`page\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`path\` varchar(255) NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`value\` longtext NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE \`page\`
        `);
    }

}
