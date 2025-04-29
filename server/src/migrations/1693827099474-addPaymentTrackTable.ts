import { MigrationInterface, QueryRunner } from "typeorm";

export class addPaymentTrackTable1693827099474 implements MigrationInterface {
    name = 'addPaymentTrackTable1693827099474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`payment_track\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` longtext NOT NULL,
                \`monthlyPrice\` int NOT NULL,
                \`annualPrice\` int NOT NULL,
                \`studentNumberLimit\` int NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`paymentTrackId\` int NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`paymentTrackId\`
        `);
        await queryRunner.query(`
            DROP TABLE \`payment_track\`
        `);
    }

}
