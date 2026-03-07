# Plan 02 — Migrate existing `unreported_events` data into `events`

## Objective
One-time migration of all historical unreported rows into `events` as read-only-origin events.

## Scope
- DB migration + minimal compatibility support.
- Keep `unreported_events` table temporarily (read-only path) until stabilization.
- Runs **after** Plan 03 (provenance flag exists on `events`).

## Key source columns
From `unreported_events`:
- `userId`
- `studentReferenceId`
- `eventTypeReferenceId`
- `reporterStudentReferenceId`
- `classReferenceId`
- `eventMonth`
- `year`
- `createdAt`, `updatedAt`

## Target columns in `events` (proposed mapping)
- `userId` -> `userId`
- `studentReferenceId` -> `studentReferenceId`
- `eventTypeReferenceId` -> `eventTypeReferenceId`
- `classReferenceId` -> `studentClassReferenceId`
- `year` -> `year`
- `createdAt`/`updatedAt` -> preserved if feasible in migration script
- Additional new provenance columns (defined in Plan 03)

## Tasks
1. Add migration file under `server/src/migrations` via TypeORM inside Docker:
	- `docker compose exec server yarn typeorm:generate --name MigrateUnreportedEventsToEvents`
	- or `docker compose exec server yarn typeorm:create --name MigrateUnreportedEventsToEvents`.
2. Insert rows from `unreported_events` into `events` using mapping key `(userId, studentReferenceId, eventTypeReferenceId, year)` for provenance/lookup logic.
3. Do **not** add deduplication logic in this phase unless blocked by an existing DB constraint.
4. Backfill provenance order (tatnikit-first/student-first) using timestamp ordering.
5. Produce migration sanity queries (before/after counts and mapping integrity checks).

## Acceptance criteria
- No unreported data is lost.
- Migration completes without data loss and without breaking existing reads.
- Provenance state is populated for migrated rows.

## Validation
- Run migration on local/dev DB snapshot.
- Verify sample records manually.
