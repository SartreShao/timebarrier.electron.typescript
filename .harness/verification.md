# Verification

## Required For Backend Or API Adapter Changes

The API server must be running first.

```powershell
npm run server:smoke
```

The smoke test creates an isolated `smoke-*` user and verifies:

- login
- plan creation and relation hydration
- ability creation and relation hydration
- target subject creation
- target creation with milestone
- tomato creation
- tomato-plan relation creation
- list reads used by the app

## Required For Frontend Changes

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm run build
```

Known remaining warnings:

- CSS order warnings from legacy scoped Stylus chunks.
- Bundle size warning for `chunk-vendors`.
- Browserslist update notice.

Treat TypeScript errors or API smoke failures as blockers.

## Manual Browser Smoke

With MySQL, API, and frontend running:

1. Open `http://127.0.0.1:8090`.
2. Confirm clean start routes to login.
3. Login with `demo`.
4. Confirm `/plan` has plan data.
5. Click bottom tabs: plan, target/ability, statistic, me.
6. Reload `/` with the user remembered and confirm it restores `/plan` with data.
