import { MigrationInterface, QueryRunner } from "typeorm";

export class AddKeyFieldToEntities1746359287668 implements MigrationInterface {
    name = 'AddKeyFieldToEntities1746359287668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`course_paths\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`key\` int NOT NULL,
                \`description\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`course_paths_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\`
            ADD \`key\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\`
            ADD \`key\` int NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`coursePathId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`coursePathReferenceId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`tz\` varchar(9) NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`events_course_path_id_idx\` ON \`events\` (\`coursePathReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`students_tz_idx\` ON \`students\` (\`tz\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_eaa9509e11fbfbaaa2b2cb9dffd\` FOREIGN KEY (\`coursePathReferenceId\`) REFERENCES \`course_paths\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_eaa9509e11fbfbaaa2b2cb9dffd\`
        `);
        await queryRunner.query(`
            DROP INDEX \`students_tz_idx\` ON \`students\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_course_path_id_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`tz\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`coursePathReferenceId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`coursePathId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\` DROP COLUMN \`key\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\` DROP COLUMN \`key\`
        `);
        await queryRunner.query(`
            DROP INDEX \`course_paths_user_id_idx\` ON \`course_paths\`
        `);
        await queryRunner.query(`
            DROP TABLE \`course_paths\`
        `);
    }

}
