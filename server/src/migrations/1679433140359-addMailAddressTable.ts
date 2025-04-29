import { MigrationInterface, QueryRunner } from "typeorm";

export class addMailAddressTable1679433140359 implements MigrationInterface {
    name = 'addMailAddressTable1679433140359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`mail_address\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`alias\` varchar(255) NOT NULL,
                \`entity\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_10d2242b0e45f6add0b4269cbf\` (\`userId\`, \`entity\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_10d2242b0e45f6add0b4269cbf\` ON \`mail_address\`
        `);
        await queryRunner.query(`
            DROP TABLE \`mail_address\`
        `);
    }

}
