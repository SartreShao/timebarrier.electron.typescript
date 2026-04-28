# Runbook

All commands assume PowerShell and repo root:

```powershell
cd F:\code\harness\timebarrier.electron.typescript
```

## Install

```powershell
npm install --legacy-peer-deps
cd server
npm install
cd ..
```

The frontend is an older Vue CLI/Electron stack. Use this when running build or serve on modern Node:

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'
```

## Start Local MySQL

```powershell
docker compose up -d mysql
npm run db:init
```

Default database:

```text
host: 127.0.0.1
port: 3307
database: timebarrier_ts
user: root
password: timebarrier
```

## Start API

```powershell
npm run server:dev
```

API base URL:

```text
http://127.0.0.1:3999/api
```

## Start Frontend

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm run serve -- --port 8090
```

Open:

```text
http://127.0.0.1:8090
```

Login with any non-empty user ID. `demo` is the local sample user.

## Electron

Use after the API and database are running:

```powershell
$env:NODE_OPTIONS='--openssl-legacy-provider'
npm run electron:serve
```

Build targets remain managed by `vue-cli-plugin-electron-builder`.
