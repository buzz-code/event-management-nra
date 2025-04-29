import { MigrationInterface, QueryRunner } from "typeorm";

export class addImageTable1689856702136 implements MigrationInterface {
    name = 'addImageTable1689856702136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`image\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`imageTarget\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`fileDataSrc\` mediumtext NOT NULL,
                \`fileDataTitle\` text NOT NULL,
                UNIQUE INDEX \`IDX_35596848f8bb8f7b5ec5fcf9e0\` (\`userId\`, \`imageTarget\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_35596848f8bb8f7b5ec5fcf9e0\` ON \`image\`
        `);
        await queryRunner.query(`
            DROP TABLE \`image\`
        `);
    }

}
