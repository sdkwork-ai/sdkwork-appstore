-- sdkwork:migration
-- id: 0009_expert_catalog
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Reverse the additive expert-catalog table.
-- reversible: true
-- rollback: down-migration
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 60s

BEGIN;

DROP TABLE IF EXISTS appstore_expert_catalog;

COMMIT;
