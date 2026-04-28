# MySQL backend

This project no longer talks to LeanCloud at runtime. The Vue/Electron client imports `src/lib/api/index.ts`, which now exposes the old API shape while forwarding data to the local HTTP backend in `server/`.

## Local stack

1. Start MySQL:

   ```powershell
   docker compose up -d mysql
   ```

2. Create or update schema:

   ```powershell
   npm run db:init
   ```

3. Start API:

   ```powershell
   npm run server:dev
   ```

4. Start frontend:

   ```powershell
   $env:NODE_OPTIONS='--openssl-legacy-provider'
   npm run serve -- --port 8090
   ```

The default API is `http://127.0.0.1:3999/api`. Override it for the frontend with `VUE_APP_TIMEBARRIER_API_URL`, or for the smoke harness with `TIMEBARRIER_API_URL`.

## Schema map

The LeanCloud classes were reconstructed into these MySQL tables:

| LeanCloud class | MySQL table | Notes |
| --- | --- | --- |
| `_User` | `users` | The login identifier is the primary key. |
| `Plan` | `plans` | Temporary and daily plans share the same table. |
| `Ability` | `abilities` | Relation lists are hydrated from join tables. |
| `TargetSubject` | `target_subjects` | Owns grouped active targets. |
| `Target` | `targets` | Optional `target_subject_id`; milestones are separate rows. |
| `Tomato` | `tomatoes` | Duration is stored in milliseconds. |
| `AbilityPlan` | `ability_plans` | Ability to plan many-to-many relation. |
| `AbilityTarget` | `ability_targets` | Ability to target many-to-many relation. |
| `TargetPlan` | `target_plans` | Target to plan many-to-many relation. |
| `TomatoPlan` | `tomato_plans` | Tomato to plan many-to-many relation. |
| `MileStone` | `milestones` | Ordered target milestones. |
| `LevelRule` | `level_rules` | Seeded by `server/schema.sql`. |
| `Global` | `global_settings` | Stores `closedBeta`. |

The server responses intentionally keep the old LeanCloud-like object envelope:

```json
{
  "className": "Plan",
  "id": "plan_x",
  "createdAt": "2026-04-28T00:00:00.000Z",
  "updatedAt": "2026-04-28T00:00:00.000Z",
  "attributes": {}
}
```

Keep this envelope stable unless you also update all viewmodels.
