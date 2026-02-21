import { MigrationInterface, QueryRunner } from "typeorm"

export class backfillFamilyTeacherAssignment1771705472587 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rows: any[] = await queryRunner.query(`
            SELECT
                e.\`user_id\`,
                e.\`year\`,
                s.\`family_reference_id\` AS familyReferenceId,
                e.\`id\`                  AS eventId,
                e.\`teacherReferenceId\`,
                e.\`createdAt\`           AS assignedAt,
                e.\`eventDate\`
            FROM \`events\` e
            JOIN \`students\` s ON e.\`studentReferenceId\` = s.\`id\`
            WHERE s.\`family_reference_id\` IS NOT NULL
              AND e.\`teacherReferenceId\`  IS NOT NULL
              AND e.\`year\`               IS NOT NULL
            ORDER BY e.\`user_id\`, e.\`year\`, s.\`family_reference_id\`, e.\`eventDate\` ASC, e.\`id\` ASC
        `);

        const grouped = new Map<string, any>();
        for (const row of rows) {
            const key = `${row.user_id}|${row.year}|${row.familyReferenceId}`;
            if (!grouped.has(key)) {
                grouped.set(key, {
                    user_id: row.user_id,
                    year: row.year,
                    familyReferenceId: row.familyReferenceId,
                    teacherReferenceId: row.teacherReferenceId,
                    history: [],
                });
            }
            const group = grouped.get(key);
            group.history.push({
                eventId: row.eventId,
                teacherReferenceId: row.teacherReferenceId,
                assignedAt: row.assignedAt,
                source: 'backfill',
            });
            // rows ordered ASC — last one is the most recent teacher
            group.teacherReferenceId = row.teacherReferenceId;
        }

        for (const group of grouped.values()) {
            await queryRunner.query(
                `INSERT INTO \`family_teacher_assignment\`
                    (\`user_id\`, \`year\`, \`familyReferenceId\`, \`teacherReferenceId\`, \`historyJson\`, \`createdAt\`, \`updatedAt\`)
                 VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
                [group.user_id, group.year, group.familyReferenceId, group.teacherReferenceId, JSON.stringify(group.history)],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM \`family_teacher_assignment\` WHERE 1 = 1`);
    }

}
