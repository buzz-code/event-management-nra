import { MigrationInterface, QueryRunner } from "typeorm";

export class TatnikiotFeature1764064167574 implements MigrationInterface {
    name = 'TatnikiotFeature1764064167574'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`tatnikiot\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`year\` int NULL,
                \`studentTz\` varchar(255) NULL,
                \`studentReferenceId\` int NULL,
                \`classKey\` int NULL,
                \`classReferenceId\` int NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`tatnikiot_class_idx\` (\`classReferenceId\`),
                INDEX \`tatnikiot_student_idx\` (\`studentReferenceId\`),
                INDEX \`tatnikiot_user_id_idx\` (\`user_id\`),
                UNIQUE INDEX \`IDX_3399215041906d8a8831f30abe\` (\`user_id\`, \`classReferenceId\`, \`year\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`unreported_events\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`year\` int NULL,
                \`studentTz\` varchar(255) NULL,
                \`studentReferenceId\` int NULL,
                \`eventTypeKey\` int NULL,
                \`eventTypeReferenceId\` int NULL,
                \`eventDate\` datetime NOT NULL,
                \`eventHebrewDate\` varchar(255) NULL,
                \`eventHebrewMonth\` varchar(255) NULL,
                \`reporterStudentTz\` varchar(255) NULL,
                \`reporterStudentReferenceId\` int NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`unreported_events_reporter_idx\` (\`reporterStudentReferenceId\`),
                INDEX \`unreported_events_event_type_idx\` (\`eventTypeReferenceId\`),
                INDEX \`unreported_events_student_idx\` (\`studentReferenceId\`),
                INDEX \`unreported_events_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`reportedByTatnikit\` tinyint NOT NULL DEFAULT 0
        `);
        await queryRunner.query(`
            ALTER TABLE \`tatnikiot\`
            ADD CONSTRAINT \`FK_cc70008ca301395e6256cefdb48\` FOREIGN KEY (\`studentReferenceId\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`tatnikiot\`
            ADD CONSTRAINT \`FK_f88a99b947e70b3600bcadcbe22\` FOREIGN KEY (\`classReferenceId\`) REFERENCES \`classes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\`
            ADD CONSTRAINT \`FK_68b23c8a32b35423a8f0e39744d\` FOREIGN KEY (\`studentReferenceId\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\`
            ADD CONSTRAINT \`FK_3ac25b810ea351abd2c4e2068bf\` FOREIGN KEY (\`eventTypeReferenceId\`) REFERENCES \`event_types\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\`
            ADD CONSTRAINT \`FK_400c2e8f98d410aad306162460e\` FOREIGN KEY (\`reporterStudentReferenceId\`) REFERENCES \`students\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\` DROP FOREIGN KEY \`FK_400c2e8f98d410aad306162460e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\` DROP FOREIGN KEY \`FK_3ac25b810ea351abd2c4e2068bf\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\` DROP FOREIGN KEY \`FK_68b23c8a32b35423a8f0e39744d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`tatnikiot\` DROP FOREIGN KEY \`FK_f88a99b947e70b3600bcadcbe22\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`tatnikiot\` DROP FOREIGN KEY \`FK_cc70008ca301395e6256cefdb48\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`reportedByTatnikit\`
        `);
        await queryRunner.query(`
            DROP INDEX \`unreported_events_user_id_idx\` ON \`unreported_events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`unreported_events_student_idx\` ON \`unreported_events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`unreported_events_event_type_idx\` ON \`unreported_events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`unreported_events_reporter_idx\` ON \`unreported_events\`
        `);
        await queryRunner.query(`
            DROP TABLE \`unreported_events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_3399215041906d8a8831f30abe\` ON \`tatnikiot\`
        `);
        await queryRunner.query(`
            DROP INDEX \`tatnikiot_user_id_idx\` ON \`tatnikiot\`
        `);
        await queryRunner.query(`
            DROP INDEX \`tatnikiot_student_idx\` ON \`tatnikiot\`
        `);
        await queryRunner.query(`
            DROP INDEX \`tatnikiot_class_idx\` ON \`tatnikiot\`
        `);
        await queryRunner.query(`
            DROP TABLE \`tatnikiot\`
        `);
    }

}
