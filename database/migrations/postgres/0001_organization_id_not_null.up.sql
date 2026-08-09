-- sdkwork:migration
-- id: 0001_organization_id_not_null
-- engine: postgres
-- module: sdkwork-appstore
-- purpose: Enforce organization_id NOT NULL DEFAULT on all tables in the
--   consolidated baseline. NULL rows (pre-standard data anomalies) are
--   backfilled with the platform sentinel before NOT NULL is set, and
--   NOT NULL columns without an explicit default receive the sentinel
--   default, keeping existing deployments consistent with fresh baseline
--   installs.
-- reversible: false
-- rollback: forward-fix (sentinel backfill is the canonical fix; NULL
--   organization rows are data anomalies)
-- transactional: true
-- lock: lightweight
-- lock_timeout: 2s
-- statement_timeout: 30s

BEGIN;

UPDATE appstore_idempotency_key SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_idempotency_key ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_idempotency_key ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_publisher SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_publisher ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_publisher ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_publisher_member SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_publisher_member ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_publisher_member ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_publisher_verification SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_publisher_verification ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_publisher_verification ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_app SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_app ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_app ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_app_dependency SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_app_dependency ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_app_dependency ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_listing SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_listing ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_listing ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_listing_localization SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_listing_localization ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_listing_localization ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_listing_media SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_listing_media ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_listing_media ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_regional_availability SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_regional_availability ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_regional_availability ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_compliance_profile SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_compliance_profile ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_compliance_profile ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_compliance_permission_disclosure SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_compliance_permission_disclosure ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_compliance_permission_disclosure ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_release SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_release ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_release ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_release_note_localization SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_release_note_localization ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_release_note_localization ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_release_artifact SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_release_artifact ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_release_artifact ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_release_rollout SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_release_rollout ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_release_rollout ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_market_channel SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_market_channel ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_market_channel ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_market_release SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_market_release ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_market_release ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_listing_submission SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_listing_submission ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_listing_submission ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_moderation_review SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_moderation_review ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_moderation_review ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_moderation_decision SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_moderation_decision ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_moderation_decision ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_entitlement SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_entitlement ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_entitlement ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_download_grant SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_download_grant ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_download_grant ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_install_event SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_install_event ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_install_event ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_app_template SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE appstore_app_template ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE appstore_app_template ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_app_template_version SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE appstore_app_template_version ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE appstore_app_template_version ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_app_template_usage SET organization_id = 0 WHERE organization_id IS NULL;
ALTER TABLE appstore_app_template_usage ALTER COLUMN organization_id SET DEFAULT 0;
ALTER TABLE appstore_app_template_usage ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_listing_iap_item SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_listing_iap_item ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_listing_iap_item ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_moderation_appeal SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_moderation_appeal ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_moderation_appeal ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_release_beta_invite SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_release_beta_invite ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_release_beta_invite ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_listing_rating SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_listing_rating ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_listing_rating ALTER COLUMN organization_id SET NOT NULL;

UPDATE appstore_feedback SET organization_id = '0' WHERE organization_id IS NULL;
ALTER TABLE appstore_feedback ALTER COLUMN organization_id SET DEFAULT '0';
ALTER TABLE appstore_feedback ALTER COLUMN organization_id SET NOT NULL;

COMMIT;
