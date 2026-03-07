# Plan 04 — Add rules table (`teacher_assignment_rules`)

## Objective
Create a rules table to drive deterministic teacher assignment.

## Rules v1 coverage
- Class/grade priority per teacher.
- Load balancing policy.
- Optional teacher capacity/balance factor (teacher can take more than `1/x` share).
- Family -> default teacher mapping managed in dedicated table.

## Proposed table model (minimal, per decision)

### 1) `teacher_assignment_rules` (single row per teacher)
- `id`
- `userId`
- `year`
- `teacherReferenceId`
- `classRulesJson` (nullable JSON; simple class preferences)
- `gradeRulesJson` (nullable JSON; simple grade preferences)
- `customRatio` (nullable decimal; optional capacity beyond equal split)
- `isActive` (boolean, default `true`)
- `createdAt`, `updatedAt`

### 2) `family_teacher_assignment` (current default + history in JSON)
- `id`
- `userId`
- `year`
- `familyReferenceId`
- `teacherReferenceId` (nullable; can be cleared to force recalculation on next assignment)
- `historyJson` (JSON array of `{ eventId, teacherReferenceId, assignedAt, source }`)
- `createdAt`, `updatedAt`

Notes:
- User can manually change `teacherReferenceId` as default teacher for future assignments.
- User can clear `teacherReferenceId` to let next assignment re-evaluate by rules.
- UI can show per-family assigned teachers in the past from `historyJson` and current default from `teacherReferenceId`.

## Scope
- Migration + entity + module/config + basic admin CRUD.

## Files to touch
- `server/src/migrations/*`
- `server/src/db/entities/*` (new rule entity + family-teacher entity)
- `server/src/entity-modules/*` (new module config)
- `server/src/entities.module.ts`
- `client/src/App.jsx` + translations for admin management screen

## Tasks
1. Create migration(s) via TypeORM inside Docker:
	- `docker compose exec server yarn typeorm:generate --name AddTeacherAssignmentRules`
	- or `docker compose exec server yarn typeorm:create --name AddTeacherAssignmentRules`.
2. Add entities and register module(s).
3. Add CRUD screens for admin maintenance (`teacher_assignment_rules` and `family_teacher_assignment`).
4. Backfill `family_teacher_assignment` from historical event assignments during first migration.
5. Add indexes for lookup performance (`userId`, `year`, `isActive`, `teacherReferenceId`, `familyReferenceId`).

## Acceptance criteria
- Admin can CRUD rules.
- Rules are queryable by `userId/year` and active state.
- Data model supports weighted balancing via optional `customRatio`.
- Per-family current default teacher is editable.
- Per-family assignment history is visible from `historyJson`.

## Validation
- CRUD smoke tests.
- Validation that clearing family default triggers recalculation in next assignment flow.
