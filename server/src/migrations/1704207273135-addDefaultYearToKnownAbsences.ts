import { MigrationInterface, QueryRunner } from "typeorm"
import { getCurrentHebrewYear } from "@shared/utils/entity/year.util";

export class addDefaultYearToKnownAbsences1704207273135 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE \`known_absences\`
            SET \`year\` = ${getCurrentHebrewYear()}
            WHERE \`year\` IS NULL or \`year\` = 0;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
