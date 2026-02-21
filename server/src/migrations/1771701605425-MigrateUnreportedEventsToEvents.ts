import { MigrationInterface, QueryRunner } from "typeorm"
import { getGregorianDateFromHebrew } from '@shared/utils/formatting/hebrew.util';

/**
 * Data migration: timestamp cluster 1771701605424–1771701605425
 *
 * Two operations performed together so they can be reverted atomically:
 *
 * 1. Backfill `reportOrigin` on every pre-existing event in `events`:
 *      reportedByTatnikit = TRUE  → 'both_tatnikit_first'
 *        (tatnikit reported AND student has already called → event exists)
 *      reportedByTatnikit = FALSE → 'only_student'
 *
 * 2. INSERT rows from `unreported_events` into `events` as 'only_tatnikit'
 *      (student has NOT yet called – these are pending tatnikit reports)
 *
 *    Column mapping:
 *      unreported_events                 → events
 *      ─────────────────────────────────────────────────
 *      user_id                           → user_id
 *      studentReferenceId                → studentReferenceId
 *      eventTypeReferenceId              → eventTypeReferenceId
 *      classReferenceId                  → studentClassReferenceId
 *      year                              → year
 *      createdAt / updatedAt             → MIGRATION_TIMESTAMP (fixed marker)
 *
 *    Derived columns:
 *      name        ← event_types.name (Hebrew)  fallback: 'אירוע <id>'
 *      eventDate   ← getGregorianDateFromHebrew(year, eventMonth, 1)
 *      reportedByTatnikit ← TRUE
 *      reportOrigin       ← 'only_tatnikit'
 *
 * To verify migrated rows after the fact:
 *   SELECT * FROM `events` WHERE `createdAt` = FROM_UNIXTIME(1771701605.425);
 *   -- or in JS: new Date(1771701605425)
 *
 * PREREQUISITE: AddEventReportOrigin1771701605424 must run first (adds the column).
 */

/** Fixed marker timestamp — matches this migration's own numeric ID (ms). */
const MIGRATION_TIMESTAMP = new Date(1771701605425);

export class MigrateUnreportedEventsToEvents1771701605425 implements MigrationInterface {
    name = 'MigrateUnreportedEventsToEvents1771701605425'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ── 1. Backfill reportOrigin on all pre-existing events ──────────────
        await queryRunner.query(`
            UPDATE \`events\`
            SET \`reportOrigin\` = CASE
                WHEN \`reportedByTatnikit\` = 1 THEN 'both_tatnikit_first'
                ELSE 'only_student'
            END
            WHERE \`reportOrigin\` IS NULL
        `);

        // ── 2. Migrate unreported_events → events ─────────────────────────────
        const rows: any[] = await queryRunner.query(`
            SELECT
                u.\`user_id\`,
                u.\`studentReferenceId\`,
                u.\`eventTypeReferenceId\`,
                u.\`classReferenceId\`,
                u.\`year\`,
                u.\`eventMonth\`,
                COALESCE(
                    NULLIF(et.\`name\`, ''),
                    CONCAT('אירוע ', u.\`eventTypeReferenceId\`)
                ) AS \`eventTypeName\`
            FROM \`unreported_events\` u
            LEFT JOIN \`event_types\` et ON et.\`id\` = u.\`eventTypeReferenceId\`
        `);

        if (rows.length === 0) return;

        const placeholders = rows.map(() =>
            `(?, ?, ?, ?, ?, ?, ?, 1, 'only_tatnikit', ?, ?)`
        ).join(',\n');

        const params = rows.flatMap(row => {
            const eventDate = (row.year && row.eventMonth)
                ? getGregorianDateFromHebrew(row.year, row.eventMonth, 1)
                : new Date();
            return [
                row.user_id,
                row.studentReferenceId,
                row.eventTypeReferenceId,
                row.classReferenceId,
                row.year,
                row.eventTypeName,
                eventDate,
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
                \`createdAt\`,
                \`updatedAt\`
            ) VALUES ${placeholders}
        `, params);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ── 2 reversed: remove migrated unreported rows ───────────────────────
        await queryRunner.query(`
            DELETE e
            FROM \`events\` e
            INNER JOIN \`unreported_events\` u
                ON  e.\`user_id\`              = u.\`user_id\`
                AND e.\`studentReferenceId\`   = u.\`studentReferenceId\`
                AND e.\`eventTypeReferenceId\` = u.\`eventTypeReferenceId\`
                AND e.\`year\`                 = u.\`year\`
            WHERE e.\`reportOrigin\` = 'only_tatnikit'
        `);

        // ── 1 reversed: clear reportOrigin on all remaining events ────────────
        await queryRunner.query(`
            UPDATE \`events\` SET \`reportOrigin\` = NULL
        `);
    }
}
