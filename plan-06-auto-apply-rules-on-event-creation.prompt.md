# Plan 06 — Auto-apply rules on event creation (Yemot + standard flows)

## Objective
Apply the same rules engine automatically when events are created, including Yemot flows.

## Scope
- Server event creation paths, especially `yemot-handler.service.ts`.

## Tasks
1. Identify all event creation entry points (Yemot, manual create/import if relevant).
2. Inject assignment service call before event save or immediately after creation (single consistent approach).
3. In assignment service, resolve in order:
  - existing `family_teacher_assignment.teacherReferenceId` (if present),
  - otherwise evaluate active teacher rules,
  - then persist family default and append to `historyJson`.
4. Ensure provenance updates (`only_*` / `both_*`) do not break assignment behavior.
5. Handle idempotency: repeated reports for same logical event should preserve family default consistency.
6. Add fallback behavior when no rule matches.

## Acceptance criteria
- New events are assigned automatically by rules.
- Existing manual bulk assignment and auto assignment use the same engine.
- Sister/household consistency is preserved.

## Validation
- End-to-end test scenarios:
  - Tatnikit first then student.
  - Student first then tatnikit.
  - Household members reported at different times.
- Regression check on Yemot flow.
