# TimeBarrier Electron TypeScript

TimeBarrier is a Vue 2 + Electron Pomodoro app. This branch has been migrated away from LeanCloud runtime APIs and now uses a local MySQL-backed HTTP server.

## Run locally

```powershell
npm install --legacy-peer-deps
docker compose up -d mysql
npm run db:init
npm run server:dev
```

In another terminal:

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm run serve -- --port 8090
```

Open `http://127.0.0.1:8090` and log in with any non-empty user ID, for example `demo`.

## Verify

With the API server running:

```powershell
npm run server:smoke
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm run build
```

More migration and maintenance notes live in:

- `.harness/README.md`
- `docs/mysql-backend.md`
- `docs/ai-maintenance-harness.md`
