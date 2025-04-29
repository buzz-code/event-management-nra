import { MigrationInterface, QueryRunner } from "typeorm";

export class addIndexesForYemotCall1695364381711 implements MigrationInterface {
    name = 'addIndexesForYemotCall1695364381711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX \`texts_user_id_name_idx\` ON \`texts\` (\`user_id\`, \`name\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`texts_name_idx\` ON \`texts\` (\`name\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_17d1817f241f10a3dbafb169fd\` ON \`users\` (\`phone_number\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_0390262acca3e09112e014e3e4\` ON \`yemot_call\` (\`apiCallId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`teachers_user_id_phone2_idx\` ON \`teachers\` (\`user_id\`, \`phone2\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`teachers_user_id_phone_idx\` ON \`teachers\` (\`user_id\`, \`phone\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`klasses_user_id_key_idx\` ON \`klasses\` (\`user_id\`, \`key\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`lessons_user_id_key_idx\` ON \`lessons\` (\`user_id\`, \`key\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`student_klasses_user_klass_year_idx\` ON \`student_klasses\` (\`user_id\`, \`klassReferenceId\`, \`year\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_user_sheet_name_lession_klass_year_idx\` ON \`att_reports\` (
                \`user_id\`,
                \`sheet_name\`,
                \`lessonReferenceId\`,
                \`klassReferenceId\`,
                \`year\`
            )
        `);
        await queryRunner.query(`
            CREATE INDEX \`grades_user_lesson_klass_year_idx\` ON \`grades\` (
                \`user_id\`,
                \`lessonReferenceId\`,
                \`klassReferenceId\`,
                \`year\`
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`grades_user_lesson_klass_year_idx\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_user_sheet_name_lession_klass_year_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`student_klasses_user_klass_year_idx\` ON \`student_klasses\`
        `);
        await queryRunner.query(`
            DROP INDEX \`lessons_user_id_key_idx\` ON \`lessons\`
        `);
        await queryRunner.query(`
            DROP INDEX \`klasses_user_id_key_idx\` ON \`klasses\`
        `);
        await queryRunner.query(`
            DROP INDEX \`teachers_user_id_phone_idx\` ON \`teachers\`
        `);
        await queryRunner.query(`
            DROP INDEX \`teachers_user_id_phone2_idx\` ON \`teachers\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0390262acca3e09112e014e3e4\` ON \`yemot_call\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_17d1817f241f10a3dbafb169fd\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP INDEX \`texts_name_idx\` ON \`texts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`texts_user_id_name_idx\` ON \`texts\`
        `);
    }

}
