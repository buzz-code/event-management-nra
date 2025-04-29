import { MigrationInterface, QueryRunner } from "typeorm";

export class addReportMonthsTable1684139644957 implements MigrationInterface {
    name = 'addReportMonthsTable1684139644957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`texts\` DROP FOREIGN KEY \`FK_3bd98826defee1e013ee26a4406\`
        `);
        await queryRunner.query(`
            CREATE TABLE \`report_month\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`startDate\` datetime NOT NULL,
                \`endDate\` datetime NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE \`report_month\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`texts\`
            ADD CONSTRAINT \`FK_3bd98826defee1e013ee26a4406\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
