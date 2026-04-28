# AI Maintenance Rules

## Preserve These Boundaries

- Do not reintroduce LeanCloud runtime reads or writes.
- Keep `src/lib/api/index.ts` as the frontend compatibility boundary.
- Keep server responses LeanCloud-like until viewmodels are intentionally refactored.
- Avoid broad UI rewrites. The current app has many legacy mobile-first views; change the smallest surface needed.
- Keep MySQL schema changes in `server/schema.sql` and update this knowledge base when schema changes.

## Before Editing

1. Confirm the current repo is `F:\code\harness\timebarrier.electron.typescript`.
2. Check `git status` and avoid reverting unrelated user changes.
3. Read the relevant viewmodel before editing UI. Most behavior is in `src/lib/vue-viewmodels/`.
4. Use the smoke harness after backend/API adapter changes.

## Common Pitfalls

- The old sibling repo is not the active product.
- The frontend still imports `leancloud-storage` for legacy TypeScript annotations. That does not mean LeanCloud should be used at runtime.
- Vue CLI 4 may require `NODE_OPTIONS=--openssl-legacy-provider` on modern Node.
- Existing dev/build warnings about CSS ordering and bundle size are not caused by the MySQL migration.
- Do not use PowerShell string literals to seed Chinese text unless you control encoding. Use source files or explicit Unicode escapes in one-off scripts.

## Recommended Change Pattern

1. Extend `server/schema.sql` if storage changes.
2. Add or update REST routes in `server/index.js`.
3. Keep the old frontend API method name in `src/lib/api/index.ts`.
4. Update only the viewmodel or component that owns the workflow.
5. Run `npm run server:smoke`.
6. Run `npm run build`.
