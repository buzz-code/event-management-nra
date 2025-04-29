import { MigrationInterface, QueryRunner } from "typeorm";

export class addHandleEmailData1679606124656 implements MigrationInterface {
    name = 'addHandleEmailData1679606124656'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`recieved_mail\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` int NOT NULL,
                \`mailData\` text NOT NULL,
                \`from\` varchar(255) NOT NULL,
                \`to\` varchar(255) NOT NULL,
                \`subject\` varchar(255) NOT NULL,
                \`body\` varchar(255) NOT NULL,
                \`entityName\` varchar(255) NOT NULL,
                \`importFileIds\` text NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`import_file\`
            ADD \`fileSource\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`import_file\`
            ADD \`response\` varchar(255) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`import_file\` DROP COLUMN \`response\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`import_file\` DROP COLUMN \`fileSource\`
        `);
        await queryRunner.query(`
            DROP TABLE \`recieved_mail\`
        `);
    }

}
