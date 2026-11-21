-- sdkwork:migration
-- id: 0008_application_version_identity_slice
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Reverse the phase-3 additive schema.
-- reversible: true
-- rollback: down-migration
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 60s

BEGIN;

DROP INDEX IF EXISTS idx_appstore_application_release_version;
ALTER TABLE appstore_application_release DROP COLUMN IF EXISTS version_id;

DROP TABLE IF EXISTS appstore_application_version;

COMMIT;
