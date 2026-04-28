# AI maintenance harness

Use this note as the starting context for future AI maintenance work.

The local Harness-style knowledge base is in `.harness/`. Start with `.harness/README.md` when resuming project work.

## Invariants

- Do not reintroduce LeanCloud as a runtime dependency. `leancloud-storage` remains only because many legacy TypeScript annotations still reference `AV.Object`.
- Preserve the public methods exported by `src/lib/api/index.ts`; the Vue viewmodels call that module as the compatibility boundary.
- Backend JSON must stay LeanCloud-like: `className`, `id`, `createdAt`, `updatedAt`, `attributes`.
- User login is intentionally simple for now: any non-empty ID creates or loads a user.
- Date fields sent to the frontend should be ISO strings; the API adapter hydrates `startTime`, `deadline`, and `validity` back into `Date` objects.

## Verification

Run these after backend or API adapter changes:

```powershell
npm run db:init
npm run server:smoke
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm run build
```

The smoke harness creates an isolated `smoke-*` user and verifies:

- login creates or loads a user
- plan creation and reads work
- ability, target subject, target, milestone, tomato creation work
- relation hydration works for plan, ability, target subject, and tomato reads

## Frontend checks

When testing manually, use the latest TypeScript repo:

```powershell
F:\code\harness\timebarrier.electron.typescript
```

The older sibling repo is not the current product. Start the API first, then run the Vue dev server on a free port and log in with `demo` or another local ID.
