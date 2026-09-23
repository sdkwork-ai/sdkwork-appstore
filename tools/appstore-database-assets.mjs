/**
 * Shared reader for the appstore database module's canonical schema sources.
 *
 * `DATABASE_FRAMEWORK_SPEC.md` section 7.5 makes the primary baseline an
 * immutable bootstrap anchor and states that ordered post-baseline migrations
 * are load-bearing for every deployment, including a fresh install:
 *
 * > The primary baseline is an immutable bootstrap anchor. It MUST NOT be
 * > rewritten to absorb later migrations. A fresh install applies the baseline
 * > followed by every ordered migration, so the baseline alone is not the
 * > complete active table inventory.
 *
 * Every appstore tool that used to read only
 * `ddl/baseline/postgres/0001_appstore_baseline.sql` therefore under-reported
 * the schema. The concrete cost was real: the three tables created by
 * `migrations/postgres/0003_user_store.up.sql` were absent from
 * `contract/schema.yaml`, `contract/table-registry.json` and
 * `specs/database/schema-registry.yaml`, so the published database contract
 * disagreed with the schema a fresh install actually builds.
 *
 * This module is the single source of that inventory so the catalog renderer,
 * the contract materializer and the design verifier cannot drift apart again.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const MODULE_ID = 'appstore';
export const TABLE_PREFIX = 'appstore_';

/** Immutable primary baseline, named `0001_<moduleId>_baseline.sql` (section 7.5). */
export const BASELINE_RELATIVE_PATH = 'database/ddl/baseline/postgres/0001_appstore_baseline.sql';

/** Authoritative-server migrations (section 7.1: `migrations/postgres/`). */
export const MIGRATION_DIRECTORY_RELATIVE_PATH = 'database/migrations/postgres';

const CREATE_TABLE_PATTERN = /CREATE\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?\s+([a-z0-9_]+)/gi;

/**
 * Canonical LF form of a SQL source.
 *
 * Git checks these SQL files out with CRLF on Windows (`core.autocrlf=true`,
 * no `.gitattributes` override), and CRLF breaks multi-line DDL scanning in a
 * way that is silent rather than loud: in a JavaScript regular expression `.`
 * matches every character **except** `\n`, `\r`, `\u2028` and `\u2029`, so the
 * common `(?:.|\n)*?` idiom cannot span a CRLF line boundary. Every table then
 * falls through to its TODO placeholder and the catalog renders empty while the
 * `## <table>` heading assertions still pass — a false green.
 *
 * Normalizing once, here, keeps the catalog renderer, the contract materializer
 * and the design verifier independent of the checkout's line-ending mode.
 */
export function normalizeSqlText(sql) {
  return sql.replace(/\r\n?/g, '\n');
}

/** Table names declared by one SQL source, in declaration order. */
export function extractTableNames(sql) {
  const names = [];
  for (const match of sql.matchAll(CREATE_TABLE_PATTERN)) {
    names.push(match[1]);
  }
  return names;
}

function listMigrationFileNames(migrationDir) {
  if (!existsSync(migrationDir)) return [];
  return readdirSync(migrationDir)
    .filter((fileName) => fileName.endsWith('.up.sql'))
    .sort();
}

/**
 * Ordered schema sources: the baseline first, then every ordered post-baseline
 * migration. `id` is the migration file stem, matching
 * `migrations/postgres/metadata.json` keys and `DATABASE_FRAMEWORK_SPEC.md`
 * section 7.3 migration history rows.
 */
export function readSchemaSources(root) {
  const sources = [];

  const baselinePath = join(root, BASELINE_RELATIVE_PATH);
  if (!existsSync(baselinePath)) {
    throw new Error(`appstore primary baseline is missing: ${BASELINE_RELATIVE_PATH}`);
  }
  sources.push({
    id: '0001_appstore_baseline',
    kind: 'baseline',
    file: BASELINE_RELATIVE_PATH,
    sql: normalizeSqlText(readFileSync(baselinePath, 'utf8')),
  });

  const migrationDir = join(root, MIGRATION_DIRECTORY_RELATIVE_PATH);
  for (const fileName of listMigrationFileNames(migrationDir)) {
    sources.push({
      id: fileName.replace(/\.up\.sql$/, ''),
      kind: 'migration',
      file: `${MIGRATION_DIRECTORY_RELATIVE_PATH}/${fileName}`,
      sql: normalizeSqlText(readFileSync(join(migrationDir, fileName), 'utf8')),
    });
  }

  return sources;
}

/** Concatenated baseline plus ordered migrations, for DDL text scanning. */
export function readSchemaSourceText(root) {
  return readSchemaSources(root)
    .map((source) => source.sql)
    .join('\n\n');
}

/**
 * Active `appstore_` table inventory in declaration order (baseline first, then
 * each migration's additions). Duplicate declarations collapse to the first
 * occurrence so a migration that restates a baseline table stays idempotent.
 */
export function readDatabaseTableInventory(root) {
  const seen = new Set();
  const inventory = [];
  for (const source of readSchemaSources(root)) {
    for (const tableName of extractTableNames(source.sql)) {
      if (seen.has(tableName)) continue;
      seen.add(tableName);
      inventory.push(tableName);
    }
  }
  return inventory;
}
