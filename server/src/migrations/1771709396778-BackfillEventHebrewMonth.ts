import { MigrationInterface, QueryRunner } from "typeorm"
import { getGregorianDateFromHebrew, getHebrewMonthName } from '@shared/utils/formatting/hebrew.util';

export class BackfillEventHebrewMonth1771709396778 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const PREVIOUS_MIGRATION_TIMESTAMP = new Date(1771701605425);
        const MIGRATION_TIMESTAMP = new Date(1771709396778);

        await queryRunner.query(`
            DELETE FROM \`events\`
            WHERE \`reportOrigin\` = 'only_tatnikit'
              AND \`createdAt\` = ?
        `, [PREVIOUS_MIGRATION_TIMESTAMP]);

        const rows: any[] = await queryRunner.query(`
            SELECT
                ue.\`user_id\`,
                ue.\`studentReferenceId\`,
                ue.\`eventTypeReferenceId\`,
                ue.\`classReferenceId\`,
                ue.\`year\`,
                ue.\`eventMonth\`,
                ue.\`reporterStudentReferenceId\`,
                s.\`tz\` AS \`reporterStudentTz\`,
                COALESCE(NULLIF(et.\`name\`, ''), CONCAT('אירוע ', ue.\`eventTypeReferenceId\`)) AS \`eventTypeName\`
            FROM \`unreported_events\` ue
            LEFT JOIN \`event_types\` et ON et.\`id\` = ue.\`eventTypeReferenceId\`
            LEFT JOIN \`students\` s ON s.\`id\` = ue.\`reporterStudentReferenceId\`
        `);

        if (rows.length === 0) {
            return;
        }

        const placeholders = rows.map(() =>
            `(?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'only_tatnikit', ?, ?, ?, ?)`
        ).join(',\n');

        const params = rows.flatMap((row) => {
            const eventDate = (row.year && row.eventMonth)
                ? getGregorianDateFromHebrew(row.year, row.eventMonth, 1)
                : new Date();
            const eventHebrewMonth = row.year && row.eventMonth
                ? getHebrewMonthName(row.eventMonth, row.year)
                : null;
            const eventHebrewDate = eventHebrewMonth
                ? `${eventHebrewMonth} (משוער)`
                : null;
            const reporterStudentTzNumber = row.reporterStudentTz ? parseInt(row.reporterStudentTz, 10) : null;

            return [
                row.user_id,
                row.studentReferenceId,
                row.eventTypeReferenceId,
                row.classReferenceId,
                row.year,
                row.eventTypeName,
                eventDate,
                eventHebrewDate,
                eventHebrewMonth,
                row.reporterStudentReferenceId,
                Number.isNaN(reporterStudentTzNumber) ? null : reporterStudentTzNumber,
                MIGRATION_TIMESTAMP,
                MIGRATION_TIMESTAMP,
            ];
        });

        await queryRunner.query(`
            INSERT INTO \`events\` (
                \`user_id\`,
                \`studentReferenceId\`,
                \`eventTypeReferenceId\`,
                \`studentClassReferenceId\`,
                \`year\`,
                \`name\`,
                \`eventDate\`,
                \`eventHebrewDate\`,
                \`eventHebrewMonth\`,
                \`reportedByTatnikit\`,
                \`reportOrigin\`,
                \`reporterStudentReferenceId\`,
                \`reporterStudentTz\`,
                \`createdAt\`,
                \`updatedAt\`
            ) VALUES ${placeholders}
        `, params);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const MIGRATION_TIMESTAMP = new Date(1771709396778);

        await queryRunner.query(`
            DELETE FROM \`events\`
            WHERE \`reportOrigin\` = 'only_tatnikit'
              AND \`createdAt\` = ?
        `, [MIGRATION_TIMESTAMP]);
    }

}
