# Plan 01 — Hide `unreported_event` for non-admin users

## Objective
Keep `unreported_events` backend path as-is, but hide the frontend resource for non-admin users.

## Scope
- Frontend only.
- Keep server `UnreportedEvent` entity + config unchanged.
- Keep resource accessible to admins.

## Files to touch
- `client/src/App.jsx`
- (optional) existing permission utility files only if needed for admin detection consistency.

## Tasks
1. Locate current `Resource name="unreported_event"` registration.
2. Wrap registration with admin-only condition using existing permission pattern.
3. Ensure menu group ordering remains stable for admins.
4. Ensure non-admin UI does not show the resource.

## Acceptance criteria
- Admin sees `unreported_event` resource.
- Non-admin does not see `unreported_event` resource.
- No backend/API changes.

## Validation
- Build/lint frontend.
- Manual verification with admin and non-admin identity.
