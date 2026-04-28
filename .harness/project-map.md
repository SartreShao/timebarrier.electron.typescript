# Project Map

## Purpose

TimeBarrier is a Vue 2 + Electron Pomodoro app. The current migration removes LeanCloud from runtime data storage and replaces it with a MySQL-backed local HTTP API.

## Main Runtime Pieces

- `src/main.ts` boots Vue, installs Element UI and the Composition API plugin, and initializes `src/lib/api/index.ts`.
- `src/App.vue` owns global providers and loads app data after login or restored login.
- `src/router/index.ts` defines the app routes.
- `src/lib/api/index.ts` is the compatibility boundary. It exposes the old LeanCloud-like API while talking to the local server.
- `server/index.js` exposes the REST API.
- `server/schema.sql` defines the MySQL schema.
- `docker-compose.yml` starts the local MySQL container.

## Important UI Areas

- `src/views/welcome/Welcome.vue` splash and login routing.
- `src/views/login/Login.vue` simple local user ID login.
- `src/views/plan/Plan.vue` plan list and quick create.
- `src/views/target-ability/` targets and abilities.
- `src/views/statistic/` tomato/stat charts.
- `src/views/me/` profile and settings entry.

## Generated Or Local-Only Areas

- `dist/` is build output and ignored.
- `logs/` is local runtime/test output and ignored.
- `node_modules/` and `server/node_modules/` are ignored dependency installs.
