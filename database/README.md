# APPSTORE Database Module

Canonical lifecycle assets for `sdkwork-appstore` per `DATABASE_FRAMEWORK_SPEC.md`.

- moduleId: `appstore`
- serviceCode: `APPSTORE`
- tablePrefix: `appstore_`
- databaseRole: `authoritative-server`
- engine: PostgreSQL

## Initialization state

This module is in **initialization state** for greenfield deployments:

1. **Baseline** — `database/ddl/baseline/{engine}/0001_appstore_baseline.sql` contains the full DDL snapshot.
2. **Migrations** — `database/migrations/{engine}/` is reserved for post-GA incremental schema changes only. It is intentionally empty at initialization.
3. **Drift** — run `pnpm db:drift:check` before release.

## Lifecycle policy

- `lifecycle.seedOnBoot` is `true`: the storefront catalog (categories, apps,
  listings, releases, templates, collections, dictionary rows and their
  `zh-CN`/`en-US` localizations) is initialization data, not demo scaffolding
  that only one environment owns. Every environment — development, test,
  staging, demo and production — applies the `standard` seed profile on its
  first database bootstrap, so the embedded gateway and the host-native
  installer converge to the same storefront content.
- `lifecycle.autoMigrate` stays `false`: schema evolution remains an explicit
  lifecycle command (`--bootstrap-databases` / `--migrate-databases` in the
  gateway, `pnpm db:migrate` for a standalone module run).
- Seed re-runs are safe: `ops_seed_history` records each seed file's checksum,
  locale and profile, so an unchanged seed set is skipped on later boots and a
  changed file is applied once.

## Commands

```bash
pnpm run db:validate
pnpm run db:materialize:contract
pnpm run db:plan
pnpm run db:init
pnpm run db:migrate
pnpm run db:seed
pnpm run db:status
pnpm run db:drift:check
```
