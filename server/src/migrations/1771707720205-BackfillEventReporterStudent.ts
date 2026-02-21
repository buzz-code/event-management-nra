import { MigrationInterface, QueryRunner } from "typeorm"
import { getGregorianDateFromHebrew } from '@shared/utils/formatting/hebrew.util';

export class BackfillEventReporterStudent1771707720205 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const MIGRATION_TIMESTAMP = new Date(1771701605425);

        await queryRunner.query(`
            DELETE FROM \`events\`
            WHERE \`reportOrigin\` = 'only_tatnikit'
              AND \`createdAt\` = ?
        `, [MIGRATION_TIMESTAMP]);

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
            `(?, ?, ?, ?, ?, ?, ?, 1, 'only_tatnikit', ?, ?, ?, ?)`
        ).join(',\n');

        const params = rows.flatMap((row) => {
            const eventDate = (row.year && row.eventMonth)
                ? getGregorianDateFromHebrew(row.year, row.eventMonth, 1)
                : new Date();
            const reporterStudentTzNumber = row.reporterStudentTz ? parseInt(row.reporterStudentTz, 10) : null;

            return [
                row.user_id,
                row.studentReferenceId,
                row.eventTypeReferenceId,
                row.classReferenceId,
                row.year,
                row.eventTypeName,
                eventDate,
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
        const MIGRATION_TIMESTAMP = new Date(1771701605425);

        await queryRunner.query(`
            UPDATE \`events\`
            SET
                \`reporterStudentReferenceId\` = NULL,
                \`reporterStudentTz\` = NULL
            WHERE
                \`reportOrigin\` = 'only_tatnikit'
                AND \`createdAt\` = ?
        `, [MIGRATION_TIMESTAMP]);
    }

}
