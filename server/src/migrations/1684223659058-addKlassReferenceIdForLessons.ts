import { LessThan, MigrationInterface, QueryRunner } from "typeorm";

export class addKlassReferenceIdForLessons1684223659058 implements MigrationInterface {
    name = 'addKlassReferenceIdForLessons1684223659058'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const lessonsTable = await queryRunner.getTable('lessons');
        if (!lessonsTable.columns.map(c => c.name).includes('klassReferenceIds')) {
            await queryRunner.query(`
                ALTER TABLE \`lessons\`
                ADD \`klassReferenceIds\` text NULL
            `);
        }
        await queryRunner.query(`
            CREATE TEMPORARY TABLE klass_lookup 
            SELECT 
            lessons.id, 
            GROUP_CONCAT(DISTINCT klasses.id) as klass_ids 
            FROM 
            lessons 
            join klasses on (
                klasses.user_id = lessons.user_id 
                AND klasses.year = lessons.year 
                AND klasses.key IN (
                substring_index(
                    substring_index(lessons.klasses, ',', 1), 
                    ',', 
                    -1
                ), 
                substring_index(
                    substring_index(lessons.klasses, ',', 2), 
                    ',', 
                    -1
                ), 
                substring_index(
                    substring_index(lessons.klasses, ',', 3), 
                    ',', 
                    -1
                )
                )
            ) 
            GROUP BY lessons.id
        `);
        await queryRunner.query(`
            update lessons 
            join klass_lookup on (klass_lookup.id = lessons.id) 
            set klassReferenceIds = klass_lookup.klass_ids
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`lessons\` DROP COLUMN \`klassReferenceIds\`
        `);
    }

}
