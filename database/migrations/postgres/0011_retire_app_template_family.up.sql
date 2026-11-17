-- sdkwork:migration
-- id: 0011_retire_app_template_family
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Retire the application-template family from the appstore schema.
--
--   `appstore_app_template`, `appstore_app_template_version` and
--   `appstore_app_template_usage` were the leftover scaffold shelf of the
--   storefront. Application scaffolds are owned by the deploy service
--   (`/app/v3/api/app_templates`), and the curated AI expert roster that used to
--   ride the shelf as `template_type = 'EXPERT'` now lives in its own
--   `appstore_expert_catalog` table (migration 0009, backfilled by migration
--   0010 and by the `014_expert_catalog.sql` seed). Nothing reads or writes the
--   template tables any more, so they are dropped instead of kept as a
--   compatibility surface.
--
--   The baseline (`0001_appstore_baseline.sql`) keeps its historical CREATE
--   statements: a baseline is an immutable snapshot, and the retirement is
--   expressed forward, at the end of the migration chain, so replaying the chain
--   reaches the 73-table live schema.
--
--   `DROP TABLE` without `CASCADE` is deliberate: the three tables reference each
--   other and nothing else references them. If a database still carries an
--   unexpected dependent object, this migration must fail loudly instead of
--   silently dropping it.
-- reversible: false
-- rollback: forward-fix (dropped tables and their rows are not recoverable; a
--   restore re-creates them from a backup taken before this migration)
-- transactional: true
-- lock: exclusive on appstore_app_template_usage, appstore_app_template_version,
--   appstore_app_template
-- lock_timeout: 2s
-- statement_timeout: 60s

BEGIN;

DROP TABLE IF EXISTS appstore_app_template_usage;
DROP TABLE IF EXISTS appstore_app_template_version;
DROP TABLE IF EXISTS appstore_app_template;

COMMIT;
