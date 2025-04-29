import { MigrationInterface, QueryRunner, TableColumn } from "typeorm"

export class KlassAddKlassTypeReferenceId1675366584689 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('klasses');
        if (!table.findColumnByName('klassTypeReferenceId')) {
            await queryRunner.addColumn(table, new TableColumn({
                name: 'klassTypeReferenceId',
                type: 'int',
                isNullable: true
            }));
        }
        await queryRunner.query(`
            update ${table.name}
                join klass_types on (
                    klass_types.user_id = ${table.name}.user_id AND
                    klass_types.id = ${table.name}.klass_type_id
                )
            set klassTypeReferenceId = klass_types.id
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('klasses');
        await queryRunner.dropColumn(table, 'klassTypeReferenceId');
    }

}
