# Plan 05 — Update current assignment button to use rules

## Objective
Replace random assignment in bulk action (`teacherAssociation`) with rules-based assignment.

## Current behavior reference
- Server action in `server/src/entity-modules/event.config.ts` currently assigns random teacher from selected list.

## Scope
- Server-side business logic only (button UX can remain unchanged).

## Tasks
1. Implement assignment engine/service:
   - Check `family_teacher_assignment` first: if family has `teacherReferenceId`, use it.
   - If family has no default teacher, evaluate active row-per-teacher rules (`classRulesJson`, `gradeRulesJson`, `customRatio`).
   - Apply balancing tie-breaker across active teachers.
   - Persist/update `family_teacher_assignment` default teacher and append assignment record into `historyJson`.
2. Replace random selection path in `teacherAssociation` action.
3. Keep existing bulk action request contract unless change is strictly required.
4. Add deterministic logs for audit/debug.

## Acceptance criteria
- Bulk assignment is deterministic per rules.
- Same household does not split across teachers when family default exists.
- Balancing behaves per configured strategy.
- Clearing `family_teacher_assignment.teacherReferenceId` allows next assignment to recalculate by rules.

## Validation
- Unit tests for rule precedence and balancing.
- Integration test for `teacherAssociation` action.
