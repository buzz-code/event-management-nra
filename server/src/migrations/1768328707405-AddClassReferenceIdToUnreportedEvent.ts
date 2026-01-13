import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClassReferenceIdToUnreportedEvent1768328707405 implements MigrationInterface {
    name = 'AddClassReferenceIdToUnreportedEvent1768328707405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\`
            ADD \`classReferenceId\` int NULL
        `);
        await queryRunner.query(`
            UPDATE unreported_events ue
            INNER JOIN tatnikiot t 
                ON ue.reporterStudentReferenceId = t.studentReferenceId 
                AND ue.year = t.year 
                AND ue.user_id = t.user_id
            SET ue.classReferenceId = t.classReferenceId
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`unreported_events\` DROP COLUMN \`classReferenceId\`
        `);
    }

}
