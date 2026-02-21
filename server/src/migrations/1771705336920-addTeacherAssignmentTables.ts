import { MigrationInterface, QueryRunner } from "typeorm";

export class addTeacherAssignmentTables1771705336920 implements MigrationInterface {
    name = 'addTeacherAssignmentTables1771705336920'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`family_teacher_assignment\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`year\` int NULL,
                \`familyReferenceId\` varchar(255) NULL,
                \`teacherReferenceId\` int NULL,
                \`historyJson\` text NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`fta_teacher_reference_id_idx\` (\`teacherReferenceId\`),
                INDEX \`fta_family_reference_id_idx\` (\`familyReferenceId\`),
                INDEX \`fta_year_idx\` (\`year\`),
                INDEX \`fta_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`teacher_assignment_rules\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`year\` int NULL,
                \`teacherReferenceId\` int NULL,
                \`classRulesJson\` text NULL,
                \`gradeRulesJson\` text NULL,
                \`customRatio\` decimal(7, 4) NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`tar_teacher_reference_id_idx\` (\`teacherReferenceId\`),
                INDEX \`tar_is_active_idx\` (\`isActive\`),
                INDEX \`tar_year_idx\` (\`year\`),
                INDEX \`tar_user_id_idx\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`family_teacher_assignment\`
            ADD CONSTRAINT \`FK_03aeb4442cddc3c4893fd4f2e24\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`family_teacher_assignment\`
            ADD CONSTRAINT \`FK_c0af42857df79229f86ae1d6a25\` FOREIGN KEY (\`teacherReferenceId\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`teacher_assignment_rules\`
            ADD CONSTRAINT \`FK_e53e24643367d3b15ce7d201f9e\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`teacher_assignment_rules\`
            ADD CONSTRAINT \`FK_9659b53196a0491bceb13a1a3de\` FOREIGN KEY (\`teacherReferenceId\`) REFERENCES \`teachers\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`teacher_assignment_rules\` DROP FOREIGN KEY \`FK_9659b53196a0491bceb13a1a3de\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teacher_assignment_rules\` DROP FOREIGN KEY \`FK_e53e24643367d3b15ce7d201f9e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`family_teacher_assignment\` DROP FOREIGN KEY \`FK_c0af42857df79229f86ae1d6a25\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`family_teacher_assignment\` DROP FOREIGN KEY \`FK_03aeb4442cddc3c4893fd4f2e24\`
        `);
        await queryRunner.query(`
            DROP INDEX \`tar_user_id_idx\` ON \`teacher_assignment_rules\`
        `);
        await queryRunner.query(`
            DROP INDEX \`tar_year_idx\` ON \`teacher_assignment_rules\`
        `);
        await queryRunner.query(`
            DROP INDEX \`tar_is_active_idx\` ON \`teacher_assignment_rules\`
        `);
        await queryRunner.query(`
            DROP INDEX \`tar_teacher_reference_id_idx\` ON \`teacher_assignment_rules\`
        `);
        await queryRunner.query(`
            DROP TABLE \`teacher_assignment_rules\`
        `);
        await queryRunner.query(`
            DROP INDEX \`fta_user_id_idx\` ON \`family_teacher_assignment\`
        `);
        await queryRunner.query(`
            DROP INDEX \`fta_year_idx\` ON \`family_teacher_assignment\`
        `);
        await queryRunner.query(`
            DROP INDEX \`fta_family_reference_id_idx\` ON \`family_teacher_assignment\`
        `);
        await queryRunner.query(`
            DROP INDEX \`fta_teacher_reference_id_idx\` ON \`family_teacher_assignment\`
        `);
        await queryRunner.query(`
            DROP TABLE \`family_teacher_assignment\`
        `);
    }

}
