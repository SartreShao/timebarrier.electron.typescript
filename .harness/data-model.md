# Data Model

The original app used LeanCloud classes and relation classes. The MySQL migration keeps the same object envelope at the API boundary:

```json
{
  "className": "Plan",
  "id": "plan_x",
  "createdAt": "2026-04-28T00:00:00.000Z",
  "updatedAt": "2026-04-28T00:00:00.000Z",
  "attributes": {}
}
```

## Table Map

| LeanCloud class | MySQL table | Responsibility |
| --- | --- | --- |
| `_User` | `users` | Simple user ID login and profile fields. |
| `Plan` | `plans` | Temporary and daily plans. |
| `Tomato` | `tomatoes` | Pomodoro records. |
| `TomatoPlan` | `tomato_plans` | Tomato to plan relation. |
| `Ability` | `abilities` | Ability list, status, color and stats. |
| `AbilityPlan` | `ability_plans` | Ability to plan relation. |
| `AbilityTarget` | `ability_targets` | Ability to target relation. |
| `TargetSubject` | `target_subjects` | Target grouping. |
| `Target` | `targets` | Goals and status. |
| `TargetPlan` | `target_plans` | Target to plan relation. |
| `MileStone` | `milestones` | Target milestones. |
| `LevelRule` | `level_rules` | Ability level thresholds. |
| `Global` | `global_settings` | Global flags such as `closedBeta`. |

## Hydration Rules

- Server date fields are ISO strings.
- `src/lib/api/index.ts` hydrates `startTime`, `deadline`, and `validity` to `Date`.
- Related records are returned as nested LeanCloud-like objects under existing attribute names, such as `abilityListOfPlan`, `targetListOfPlan`, `planListOfTomato`, and `targetListOfTargetSubject`.

## Login Model

The local migration intentionally uses a simple user ID:

- Any non-empty ID creates or loads a row in `users`.
- The browser stores the active ID in `localStorage` key `timebarrier.currentUserId`.
- This is a development-friendly placeholder, not final production auth.
