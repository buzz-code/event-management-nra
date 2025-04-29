import { MigrationInterface, QueryRunner } from "typeorm";

export class renameAllIndexes1708945273022 implements MigrationInterface {
    name = 'renameAllIndexes1708945273022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const indexes = [
            { index: 'IDX_17d1817f241f10a3dbafb169fd', table: 'users', columns: 'phone_number' },
            { index: 'IDX_0390262acca3e09112e014e3e4', table: 'yemot_call', columns: 'apiCallId' },
            { index: 'IDX_3a2dccf671e4550e3b4f64fd0d', table: 'att_grade_effect', columns: 'user_id' },
            { index: 'IDX_0f24e1decf6e30babbfcf59665', table: 'klass_types', columns: 'klassTypeEnum' },
            { index: 'IDX_9a2642196187f93e9fd8d20529', table: 'klasses', columns: 'klassTypeReferenceId' },
            { index: 'IDX_c4c70577f3547af4b76cdc5c0a', table: 'klasses', columns: 'teacherReferenceId' },
            { index: 'IDX_271fe2dc910f3f148d020739ad', table: 'lessons', columns: 'teacherReferenceId' },
            { index: 'IDX_130727be2ecc7acba14fc372c5', table: 'grades', columns: 'teacherReferenceId' },
            { index: 'IDX_22b82e90fafad45190f692dd05', table: 'grades', columns: 'klassReferenceId' },
            { index: 'IDX_69b8e100956b4789bd40ef793a', table: 'grades', columns: 'lessonReferenceId' },
            { index: 'IDX_c9c2f94f61f2af5e67061f5490', table: 'grades', columns: 'report_date' },
            { index: 'IDX_cb5e566bb60eecc1a258f5a9b3', table: 'grades', columns: 'studentReferenceId' },
            { index: 'IDX_214a4367cce39521a10dd18192', table: 'att_reports', columns: 'klassReferenceId' },
            { index: 'IDX_82f8943c2abf1da42d5ea056ec', table: 'att_reports', columns: 'teacherReferenceId' },
            { index: 'IDX_87e1551245da7d48e9faa8504c', table: 'att_reports', columns: 'studentReferenceId' },
            { index: 'IDX_a939d8e9cdb002cc936476d223', table: 'att_reports', columns: 'report_date' },
            { index: 'IDX_ec7ecb76abb8c9d0fba2a453d8', table: 'att_reports', columns: 'lessonReferenceId' },
            { index: 'IDX_3969f5c06a11e499582a2ad109', table: 'grade_names', columns: 'user_id' },
            { index: 'IDX_cf652cc96dec2b051bc0f2f589', table: 'known_absences', columns: 'studentReferenceId' },
            { index: 'IDX_238410e9e94aea1e793799ac84', table: 'report_month', columns: 'endDate' },
            { index: 'IDX_562609ef14135b04bfbc29c504', table: 'report_month', columns: 'userId' },
            { index: 'IDX_c26ca93193d447559f28a179f0', table: 'report_month', columns: 'startDate' },
        ];
        for (const index of indexes) {
            const table = await queryRunner.getTable(index.table);
            const tableIndex = table?.indices.find(i => i.columnNames.join(',') === index.columns);
            if (!tableIndex) {
                console.log(`Index ${index.index} not found on table ${index.table}`);
                continue;
            }
            await queryRunner.dropIndex(table, tableIndex);
        }

        await queryRunner.query(`
            CREATE INDEX \`user_phone_number_idx\` ON \`users\` (\`phone_number\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`yemot_call_api_call_id_idx\` ON \`yemot_call\` (\`apiCallId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_grade_effect_user_id_idx\` ON \`att_grade_effect\` (\`user_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`klasses_klass_type_reference_id_idx\` ON \`klasses\` (\`klassTypeReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`klasses_teacher_reference_id_idx\` ON \`klasses\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`lessons_teacher_reference_id_idx\` ON \`lessons\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`grades_student_reference_id_idx\` ON \`grades\` (\`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`grades_teacher_reference_id_idx\` ON \`grades\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`grades_klass_reference_id_idx\` ON \`grades\` (\`klassReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`grades_lesson_reference_id_idx\` ON \`grades\` (\`lessonReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`grades_report_date_idx\` ON \`grades\` (\`report_date\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_reports_student_reference_id_idx\` ON \`att_reports\` (\`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_reports_teacher_reference_id_idx\` ON \`att_reports\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_reports_klass_reference_id_idx\` ON \`att_reports\` (\`klassReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_reports_lesson_reference_id_idx\` ON \`att_reports\` (\`lessonReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`att_reports_report_date_idx\` ON \`att_reports\` (\`report_date\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`grade_names_user_id_idx\` ON \`grade_names\` (\`user_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`known_absences_student_reference_id_idx\` ON \`known_absences\` (\`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`report_month_user_id_idx\` ON \`report_month\` (\`userId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`report_month_start_date_idx\` ON \`report_month\` (\`startDate\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`report_month_end_date_idx\` ON \`report_month\` (\`endDate\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`report_month_user_id_start_date_end_date_idx\` ON \`report_month\` (\`userId\`, \`startDate\`, \`endDate\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`report_month_user_id_start_date_end_date_idx\` ON \`report_month\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_month_end_date_idx\` ON \`report_month\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_month_start_date_idx\` ON \`report_month\`
        `);
        await queryRunner.query(`
            DROP INDEX \`report_month_user_id_idx\` ON \`report_month\`
        `);
        await queryRunner.query(`
            DROP INDEX \`known_absences_student_reference_id_idx\` ON \`known_absences\`
        `);
        await queryRunner.query(`
            DROP INDEX \`grade_names_user_id_idx\` ON \`grade_names\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_reports_report_date_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_reports_lesson_reference_id_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_reports_klass_reference_id_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_reports_teacher_reference_id_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_reports_student_reference_id_idx\` ON \`att_reports\`
        `);
        await queryRunner.query(`
            DROP INDEX \`grades_report_date_idx\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`grades_lesson_reference_id_idx\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`grades_klass_reference_id_idx\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`grades_teacher_reference_id_idx\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`grades_student_reference_id_idx\` ON \`grades\`
        `);
        await queryRunner.query(`
            DROP INDEX \`lessons_teacher_reference_id_idx\` ON \`lessons\`
        `);
        await queryRunner.query(`
            DROP INDEX \`klasses_teacher_reference_id_idx\` ON \`klasses\`
        `);
        await queryRunner.query(`
            DROP INDEX \`klasses_klass_type_reference_id_idx\` ON \`klasses\`
        `);
        await queryRunner.query(`
            DROP INDEX \`att_grade_effect_user_id_idx\` ON \`att_grade_effect\`
        `);
        await queryRunner.query(`
            DROP INDEX \`yemot_call_api_call_id_idx\` ON \`yemot_call\`
        `);
        await queryRunner.query(`
            DROP INDEX \`user_phone_number_idx\` ON \`users\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_c26ca93193d447559f28a179f0\` ON \`report_month\` (\`startDate\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_562609ef14135b04bfbc29c504\` ON \`report_month\` (\`userId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_238410e9e94aea1e793799ac84\` ON \`report_month\` (\`endDate\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_cf652cc96dec2b051bc0f2f589\` ON \`known_absences\` (\`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_3969f5c06a11e499582a2ad109\` ON \`grade_names\` (\`user_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_ec7ecb76abb8c9d0fba2a453d8\` ON \`att_reports\` (\`lessonReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_a939d8e9cdb002cc936476d223\` ON \`att_reports\` (\`report_date\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_87e1551245da7d48e9faa8504c\` ON \`att_reports\` (\`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_82f8943c2abf1da42d5ea056ec\` ON \`att_reports\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_214a4367cce39521a10dd18192\` ON \`att_reports\` (\`klassReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_cb5e566bb60eecc1a258f5a9b3\` ON \`grades\` (\`studentReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_c9c2f94f61f2af5e67061f5490\` ON \`grades\` (\`report_date\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_69b8e100956b4789bd40ef793a\` ON \`grades\` (\`lessonReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_22b82e90fafad45190f692dd05\` ON \`grades\` (\`klassReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_130727be2ecc7acba14fc372c5\` ON \`grades\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_271fe2dc910f3f148d020739ad\` ON \`lessons\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_c4c70577f3547af4b76cdc5c0a\` ON \`klasses\` (\`teacherReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_9a2642196187f93e9fd8d20529\` ON \`klasses\` (\`klassTypeReferenceId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_0f24e1decf6e30babbfcf59665\` ON \`klass_types\` (\`klassTypeEnum\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_3a2dccf671e4550e3b4f64fd0d\` ON \`att_grade_effect\` (\`user_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_0390262acca3e09112e014e3e4\` ON \`yemot_call\` (\`apiCallId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_17d1817f241f10a3dbafb169fd\` ON \`users\` (\`phone_number\`)
        `);
    }

}
