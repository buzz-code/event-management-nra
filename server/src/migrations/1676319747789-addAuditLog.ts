import { MigrationInterface, QueryRunner } from "typeorm";

export class addAuditLog1676319747789 implements MigrationInterface {
    name = 'addAuditLog1676319747789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`audit_log\` (
                \`id\` int NOT NULL AUTO_INCREMENT, 
                \`userId\` int NOT NULL, 
                \`entityId\` int NOT NULL, 
                \`entityName\` varchar(255) NOT NULL, 
                \`operation\` varchar(255) NOT NULL, 
                \`entityData\` text NOT NULL, 
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), 
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`audit_log\``);
    }

}
