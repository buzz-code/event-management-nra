import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameCoursePathToLevelType1746393003380 implements MigrationInterface {
    name = 'RenameCoursePathToLevelType1746393003380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_eaa9509e11fbfbaaa2b2cb9dffd\``);
        await queryRunner.query(`DROP INDEX \`events_course_path_id_idx\` ON \`events\``);
        await queryRunner.query(`CREATE TABLE \`level_types\` (\`id\` int NOT NULL AUTO_INCREMENT, \`user_id\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`key\` int NOT NULL, \`description\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), INDEX \`level_types_user_id_idx\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`coursePathId\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`coursePathReferenceId\``);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`levelTypeId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`levelTypeReferenceId\` int NULL`);
        await queryRunner.query(`CREATE INDEX \`events_level_type_id_idx\` ON \`events\` (\`levelTypeReferenceId\`)`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_c3a817dd6cfa3c2edc981cad0f9\` FOREIGN KEY (\`levelTypeReferenceId\`) REFERENCES \`level_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_c3a817dd6cfa3c2edc981cad0f9\``);
        await queryRunner.query(`DROP INDEX \`events_level_type_id_idx\` ON \`events\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`levelTypeReferenceId\``);
        await queryRunner.query(`ALTER TABLE \`events\` DROP COLUMN \`levelTypeId\``);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`coursePathReferenceId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD \`coursePathId\` int NULL`);
        await queryRunner.query(`DROP INDEX \`level_types_user_id_idx\` ON \`level_types\``);
        await queryRunner.query(`DROP TABLE \`level_types\``);
        await queryRunner.query(`CREATE INDEX \`events_course_path_id_idx\` ON \`events\` (\`coursePathReferenceId\`)`);
        await queryRunner.query(`ALTER TABLE \`events\` ADD CONSTRAINT \`FK_eaa9509e11fbfbaaa2b2cb9dffd\` FOREIGN KEY (\`coursePathReferenceId\`) REFERENCES \`course_paths\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
