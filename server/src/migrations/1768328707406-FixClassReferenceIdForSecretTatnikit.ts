import { MigrationInterface, QueryRunner } from "typeorm";

export class FixClassReferenceIdForSecretTatnikit1768328707406 implements MigrationInterface {
    name = 'FixClassReferenceIdForSecretTatnikit1768328707406'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE unreported_events ue
            INNER JOIN student_classes sc
                ON ue.reporterStudentReferenceId = sc.studentReferenceId
                AND ue.year = sc.year
                AND ue.user_id = sc.user_id
            SET ue.classReferenceId = sc.classReferenceId
            WHERE ue.classReferenceId IS NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
