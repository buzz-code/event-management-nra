import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStudentClassReferenceIdToEvents1748187159317 implements MigrationInterface {
    name = 'AddStudentClassReferenceIdToEvents1748187159317'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add the new column
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`studentClassReferenceId\` int NULL
        `);
        
        // Populate existing events with studentClassReferenceId (the actual class ID)
        // This query finds the first class ID for each student/year/user combination
        await queryRunner.query(`
            UPDATE \`events\` e
            JOIN (
                SELECT 
                    sc.studentReferenceId,
                    sc.year,
                    sc.user_id,
                    sc.classReferenceId
                FROM \`student_classes\` sc
                WHERE (sc.studentReferenceId, sc.year, sc.user_id, sc.id) IN (
                    SELECT studentReferenceId, year, user_id, MIN(id)
                    FROM \`student_classes\`
                    GROUP BY studentReferenceId, year, user_id
                )
            ) first_class ON e.studentReferenceId = first_class.studentReferenceId 
                         AND e.year = first_class.year 
                         AND e.user_id = first_class.user_id
            SET e.studentClassReferenceId = first_class.classReferenceId
            WHERE e.studentReferenceId IS NOT NULL
        `);
        
        // Create index after data population
        await queryRunner.query(`
            CREATE INDEX \`events_student_class_reference_id_idx\` ON \`events\` (\`studentClassReferenceId\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`events_student_class_reference_id_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`studentClassReferenceId\`
        `);
    }

}
