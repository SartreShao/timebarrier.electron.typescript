# Decision Log

## 2026-04-28 - Use MySQL plus local REST API

LeanCloud was no longer available for the product. The migration uses MySQL for durable local storage and an Express REST API for a small, inspectable backend.

## 2026-04-28 - Keep LeanCloud-like objects at the frontend boundary

The Vue app has many viewmodels typed against `AV.Object` and reading `object.attributes`. Rewriting every viewmodel would be high risk. The adapter in `src/lib/api/index.ts` keeps the old object envelope and methods while replacing the transport.

## 2026-04-28 - Simple user ID login

Authentication is intentionally minimal for revival work. A user ID is enough to create and load isolated app data. Real auth can be added later without changing the data model.

## 2026-04-28 - Use `timebarrier_ts` database

The older local DB name had legacy charset/collation conflicts. The TypeScript project uses `timebarrier_ts` to keep this migration separate and deterministic.

## 2026-04-28 - Add smoke harness

The reconstructed schema is the riskiest part of the migration. `server/scripts/smoke-test.js` verifies the core product data flow and should be kept current with schema/API changes.
