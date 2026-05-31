# event-management-nra

Event management system: events, event types, event notes, gifts.

## Stack

- **Frontend**: React-Admin (JSX) + Vite — `/client`
- **Backend**: NestJS (TypeScript) + TypeORM — `/server`
- **Database**: MySQL
- **Shared submodules**: `client/shared` -> `nra-client`, `server/shared` -> `nra-server`

Initialize before first use: `git submodule update --init --recursive`
Never modify code in `client/shared` or `server/shared` directly — those are separate repos.

## Testing

```
cd server && yarn test   # Jest + ts-jest
cd client && yarn test   # Jest + jsdom
```

Start via Docker (from the multi-repo-codespace bootstrap, one project at a time):
```
cp .env.template .env
cp docker-compose.override.yml.template docker-compose.override.yml
docker-compose up -d client server database
```

## Code Patterns

**Server entity (NestJS/TypeORM):**
1. Create TypeORM entity in `server/src/db/entities/`
2. Create config in `server/src/entity-modules/<name>.config.ts`
3. Register in `server/src/entities.module.ts`

**Client entity (React-Admin):**
1. Create `client/src/entities/<name>.jsx` with List/Create/Edit/Show
2. Register resource in `client/src/App.jsx`
3. Add translations to `client/src/domainTranslations.js`

Use shared components from `client/shared/components/` and utilities from `client/shared/utils/`.
Auth: JWT via `server/shared/auth/`. Permissions: `client/shared/utils/permissionsUtil.js`.

## Coding Guidelines

> Derived from Andrej Karpathy's observations on common LLM coding pitfalls.

**1. Think Before Coding** — Surface assumptions and tradeoffs before writing code. If something is unclear, ask — do not guess silently.

**2. Simplicity First** — Write the minimum code that solves the problem. No speculative features, abstractions, or flexibility that was not requested. If 200 lines could be 50, rewrite it.

**3. Surgical Changes** — Touch only what is necessary. Do not improve adjacent code or formatting. Match existing style. Every changed line must trace to the user's request.

**4. Goal-Driven Execution** — Define verifiable success criteria before starting. For multi-step tasks, write a brief plan with checkpoints and verify each one.