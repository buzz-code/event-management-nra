import { MigrationInterface, QueryRunner } from "typeorm"

export class deleteAllTeacherAssignmentRules1780859384868 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM \`teacher_assignment_rules\``);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Data deletion is not reversible
    }

}
