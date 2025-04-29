import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class rerunReferenceIdForProd1683527164577 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await createAndFillReferenceIdColumn(queryRunner, 'student_klasses', EnumJoinTypes.students);
        await createAndFillReferenceIdColumn(queryRunner, 'student_klasses', EnumJoinTypes.klasses);
        await createAndFillReferenceIdColumn(queryRunner, 'lessons', EnumJoinTypes.teachers);
        await createAndFillReferenceIdColumn(queryRunner, 'known_absences', EnumJoinTypes.students);
        await createAndFillReferenceIdColumn(queryRunner, 'grades', EnumJoinTypes.students);
        await createAndFillReferenceIdColumn(queryRunner, 'grades', EnumJoinTypes.teachers);
        await createAndFillReferenceIdColumn(queryRunner, 'grades', EnumJoinTypes.klasses);
        await createAndFillReferenceIdColumn(queryRunner, 'grades', EnumJoinTypes.lessons);
        await createAndFillReferenceIdColumn(queryRunner, 'att_reports', EnumJoinTypes.students);
        await createAndFillReferenceIdColumn(queryRunner, 'att_reports', EnumJoinTypes.teachers);
        await createAndFillReferenceIdColumn(queryRunner, 'att_reports', EnumJoinTypes.klasses);
        await createAndFillReferenceIdColumn(queryRunner, 'att_reports', EnumJoinTypes.lessons);
        await createAndFillReferenceIdColumn(queryRunner, 'klasses', EnumJoinTypes.klass_types);
        await createAndFillReferenceIdColumn(queryRunner, 'klasses', EnumJoinTypes.teachers);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await dropColumnFromTable(queryRunner, 'student_klasses', EnumJoinTypes.students);
        await dropColumnFromTable(queryRunner, 'student_klasses', EnumJoinTypes.klasses);
        await dropColumnFromTable(queryRunner, 'lessons', EnumJoinTypes.teachers);
        await dropColumnFromTable(queryRunner, 'known_absences', EnumJoinTypes.students);
        await dropColumnFromTable(queryRunner, 'grades', EnumJoinTypes.students);
        await dropColumnFromTable(queryRunner, 'grades', EnumJoinTypes.teachers);
        await dropColumnFromTable(queryRunner, 'grades', EnumJoinTypes.klasses);
        await dropColumnFromTable(queryRunner, 'grades', EnumJoinTypes.lessons);
        await dropColumnFromTable(queryRunner, 'att_reports', EnumJoinTypes.students);
        await dropColumnFromTable(queryRunner, 'att_reports', EnumJoinTypes.teachers);
        await dropColumnFromTable(queryRunner, 'att_reports', EnumJoinTypes.klasses);
        await dropColumnFromTable(queryRunner, 'att_reports', EnumJoinTypes.lessons);
        await dropColumnFromTable(queryRunner, 'klasses', EnumJoinTypes.klass_types);
        await dropColumnFromTable(queryRunner, 'klasses', EnumJoinTypes.teachers);
    }

}

async function getTableAndCreateColumn(queryRunner: QueryRunner, tableName: string, columnName: string) {
    const table = await queryRunner.getTable(tableName);
    if (!table.findColumnByName(columnName)) {
        await queryRunner.addColumn(table, new TableColumn({
            name: columnName,
            type: 'int',
            isNullable: true
        }));
    }
    return table;
}

async function dropColumnFromTable(queryRunner: QueryRunner, tableName: string, joinType: EnumJoinTypes) {
    const table = await queryRunner.getTable(tableName);
    await queryRunner.dropColumn(table, `${joinType}ReferenceId`);
}

enum EnumJoinTypes {
    teachers = 'teacher',
    students = 'student',
    klasses = 'klass',
    lessons = 'lesson',
    klass_types = 'klassType'
}

async function createAndFillReferenceIdColumn(queryRunner: QueryRunner, tableName: string, joinType: EnumJoinTypes) {
    const table = await getTableAndCreateColumn(queryRunner, tableName, `${joinType}ReferenceId`);

    switch (joinType) {
        case EnumJoinTypes.teachers:
            await queryRunner.query(`
            update ${table.name}
                join teachers on (
                    teachers.user_id = ${table.name}.user_id AND
                    teachers.year = ${table.name}.year AND
                    teachers.tz = ${table.name}.teacher_id
                )
            set teacherReferenceId = teachers.id
        `);
            break;
        case EnumJoinTypes.students:
            await queryRunner.query(`
            update ${table.name}
                join students on (
                    students.user_id = ${table.name}.user_id AND
                    students.year = ${table.name}.year AND
                    students.tz = ${table.name}.student_tz
                )
            set studentReferenceId = students.id
        `);
            break;
        case EnumJoinTypes.klasses:
            await queryRunner.query(`
            update ${table.name}
                join klasses on (
                    klasses.user_id = ${table.name}.user_id AND
                    klasses.year = ${table.name}.year AND
                    klasses.key = ${table.name}.klass_id
                )
            set klassReferenceId = klasses.id
        `);
            break;
        case EnumJoinTypes.lessons:
            await queryRunner.query(`
            update ${table.name}
                join lessons on (
                    lessons.user_id = ${table.name}.user_id AND
                    lessons.year = ${table.name}.year AND
                    lessons.key = ${table.name}.lesson_id
                )
            set lessonReferenceId = lessons.id
        `);
            break;
        case EnumJoinTypes.klass_types:
            await queryRunner.query(`
            update ${table.name}
                join klass_types on (
                    klass_types.user_id = ${table.name}.user_id AND
                    klass_types.id = ${table.name}.klass_type_id
                )
            set klassTypeReferenceId = klass_types.id
        `);
            break;

        default:
            break;
    }
}
