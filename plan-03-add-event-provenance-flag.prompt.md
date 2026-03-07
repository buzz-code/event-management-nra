# Plan 03 — Add provenance flag on `events`

## Objective
Represent report origin in `events` with one enum/status model:
- `only_tatnikit`
- `only_student`
- `both_tatnikit_first`
- `both_student_first`

## Scope
- Server entity + DB migration + client labels/filters.
- This step must be completed **before** unreported-to-events migration (Plan 02).

## Files to touch
- `server/src/db/entities/Event.entity.ts`
- `server/src/migrations/*`
- `client/src/entities/event.jsx` (filters/columns if required)
- `client/src/domainTranslations.js`

## Tasks
1. Add enum column in `events` entity and migration.
2. Create migration via TypeORM inside Docker (no manual migration scaffolding):
   - `docker compose exec server yarn typeorm:generate --name AddEventProvenanceFlag`
   - or `docker compose exec server yarn typeorm:create --name AddEventProvenanceFlag` (if SQL is written manually after creation).
3. Keep backward compatibility with existing `reportedByTatnikit` during transition (if still read by old flows).
4. Backfill existing events into enum state:
   - current student-created events -> `only_student`
   - tatnikit-origin events -> mapped by data available.
5. Add human-readable translation labels in UI.
6. Expose optional filter by provenance state in events list.

## Acceptance criteria
- Every relevant event has a valid provenance value.
- UI can display/read provenance clearly.
- No regression in existing event create/edit flows.

## Validation
- Unit tests for mapping helper (if introduced).
- Smoke test events list/create/edit.
