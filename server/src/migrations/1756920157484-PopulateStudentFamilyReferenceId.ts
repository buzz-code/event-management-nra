import { MigrationInterface, QueryRunner } from "typeorm"

export class PopulateStudentFamilyReferenceId1756920157484 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Update existing students with calculated family_reference_id
        await queryRunner.query(`
            UPDATE \`students\`
            SET \`family_reference_id\` = CONCAT(
                \`user_id\`, '_',
                COALESCE(\`fatherName\`, ''), '_',
                COALESCE(\`motherName\`, ''), '_',
                COALESCE(\`motherPreviousName\`, ''), '_',
                COALESCE(\`fatherContact\`, ''), '_',
                COALESCE(\`motherContact\`, '')
            )
            WHERE \`family_reference_id\` IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reset family_reference_id to NULL
        await queryRunner.query(`
            UPDATE \`students\`
            SET \`family_reference_id\` = NULL
        `);
    }

}
