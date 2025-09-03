import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFamilyReferenceIdToStudents1756916426792 implements MigrationInterface {
    name = 'AddFamilyReferenceIdToStudents1756916426792'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`family_reference_id\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD CONSTRAINT \`FK_451090889323581fba64332165a\` FOREIGN KEY (\`family_status_reference_id\`) REFERENCES \`family_status_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            CREATE VIEW \`families\` AS
            SELECT \`students\`.\`user_id\` AS \`userId\`,
                CONCAT(
                    \`students\`.\`user_id\`,
                    '_',
                    COALESCE(\`students\`.\`fatherName\`, ""),
                    '_',
                    COALESCE(\`students\`.\`motherName\`, ""),
                    '_',
                    COALESCE(\`students\`.\`motherPreviousName\`, ""),
                    '_',
                    COALESCE(\`students\`.\`fatherContact\`, ""),
                    '_',
                    COALESCE(\`students\`.\`motherContact\`, "")
                ) AS \`id\`,
                SUBSTRING_INDEX(MIN(\`students\`.\`name\`), ' ', -1) AS \`familyName\`,
                MIN(\`students\`.\`fatherName\`) AS \`fatherName\`,
                MIN(\`students\`.\`motherName\`) AS \`motherName\`,
                MIN(\`students\`.\`motherPreviousName\`) AS \`motherPreviousName\`,
                MIN(\`students\`.\`fatherContact\`) AS \`fatherContact\`,
                MIN(\`students\`.\`motherContact\`) AS \`motherContact\`,
                COUNT(\`students\`.\`id\`) AS \`numberOfDaughters\`,
                MIN(\`students\`.\`id\`) AS \`representativeStudentId\`
            FROM \`students\` \`students\`
            GROUP BY \`students\`.\`user_id\`,
                \`students\`.\`fatherName\`,
                \`students\`.\`motherName\`,
                \`students\`.\`motherPreviousName\`,
                \`students\`.\`fatherContact\`,
                \`students\`.\`motherContact\`
        `);
        await queryRunner.query(`
            INSERT INTO \`event_management_nra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["event_management_nra","VIEW","families","SELECT `students`.`user_id` AS `userId`, CONCAT(`students`.`user_id`, '_', COALESCE(`students`.`fatherName`, \"\"), '_', COALESCE(`students`.`motherName`, \"\"), '_', COALESCE(`students`.`motherPreviousName`, \"\"), '_', COALESCE(`students`.`fatherContact`, \"\"), '_', COALESCE(`students`.`motherContact`, \"\")) AS `id`, SUBSTRING_INDEX(MIN(`students`.`name`), ' ', -1) AS `familyName`, MIN(`students`.`fatherName`) AS `fatherName`, MIN(`students`.`motherName`) AS `motherName`, MIN(`students`.`motherPreviousName`) AS `motherPreviousName`, MIN(`students`.`fatherContact`) AS `fatherContact`, MIN(`students`.`motherContact`) AS `motherContact`, COUNT(`students`.`id`) AS `numberOfDaughters`, MIN(`students`.`id`) AS `representativeStudentId` FROM `students` `students` GROUP BY `students`.`user_id`, `students`.`fatherName`, `students`.`motherName`, `students`.`motherPreviousName`, `students`.`fatherContact`, `students`.`motherContact`"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`event_management_nra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","families","event_management_nra"]);
        await queryRunner.query(`
            DROP VIEW \`families\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_451090889323581fba64332165a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`family_reference_id\`
        `);
    }

}
