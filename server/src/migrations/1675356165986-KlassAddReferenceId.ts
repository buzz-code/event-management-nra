import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class KlassAddReferenceId1675356165986 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('klasses');
        if (!table.findColumnByName('teacherReferenceId')) {
            await queryRunner.addColumn(table, new TableColumn({
                name: 'teacherReferenceId',
                type: 'int',
                isNullable: true
            }));
        }
        await queryRunner.query(`
            update ${table.name}
                join teachers on (
                    teachers.user_id = ${table.name}.user_id AND
                    teachers.year = ${table.name}.year AND
                    teachers.tz = ${table.name}.teacher_id
                )
            set teacherReferenceId = teachers.id
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('klasses');
        await queryRunner.dropColumn(table, 'teacherReferenceId');
    }
}
