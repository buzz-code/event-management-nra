# Master Plan Index — Unreported Migration + Rules Engine

This file is kept as an index only. Execution plans are split into dedicated files:

1. `plan-01-hide-unreported-resource-non-admin.prompt.md`
2. `plan-03-add-event-provenance-flag.prompt.md` (**must run before migration**)
3. `plan-02-migrate-unreported-to-events.prompt.md`
4. `plan-04-add-rules-table.prompt.md`
5. `plan-05-update-assignment-button-to-rules.prompt.md`
6. `plan-06-auto-apply-rules-on-event-creation.prompt.md`

## Migration policy
- All migrations must be created by TypeORM inside Docker:
  - `docker compose exec server yarn typeorm:generate --name <MigrationName>`
  - or `docker compose exec server yarn typeorm:create --name <MigrationName>`

## Keep or delete this file?
- Optional. It can be deleted safely if you prefer to work only with the 6 split plan files.
- Keep it only as a quick entry-point/index.
