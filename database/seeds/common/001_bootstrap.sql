-- 001_bootstrap.sql — cross-cutting bootstrap and reconciliation for tenant 100001.
-- Runs last in the standard profile to finalize references created by earlier seeds.

-- SDKWork PC storefront distribution channel.
INSERT INTO appstore_market_channel
    (id, tenant_id, organization_id, channel_code, channel_type, provider, channel_status, external_store_code, api_capability_json, config_json, created_at, updated_at)
VALUES
    ('mch-sdkwork-pc', '100001', '0', 'sdkwork-pc', 'first_party', 'sdkwork-appstore', 'active', 'sdkwork-pc-store', '{"download": true, "install": true, "update": true, "presignDownload": true}', '{"surface": "pc", "runtimeFamily": "PC"}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    channel_status = EXCLUDED.channel_status,
    api_capability_json = EXCLUDED.api_capability_json,
    config_json = EXCLUDED.config_json,
    updated_at = EXCLUDED.updated_at;

-- en-US localizations for base storefront categories.
INSERT INTO appstore_category_localization
    (id, tenant_id, category_id, locale, display_name, description, created_at, updated_at)
VALUES
    ('appstore-category-apps-en', '100001', 'appstore-category-apps', 'en-US', 'Apps', 'General applications and utilities', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('appstore-category-games-en', '100001', 'appstore-category-games', 'en-US', 'Games', 'Casual and competitive games', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('appstore-category-tools-en', '100001', 'appstore-category-tools', 'en-US', 'Tools', 'Productivity and utility tools', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('appstore-category-productivity-en', '100001', 'appstore-category-productivity', 'en-US', 'Productivity', 'Office and productivity software', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('appstore-category-education-en', '100001', 'appstore-category-education', 'en-US', 'Education', 'Learning and education apps', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('appstore-category-entertainment-en', '100001', 'appstore-category-entertainment', 'en-US', 'Entertainment', 'Media and entertainment apps', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-assistants-en', '100001', 'cat-ai-assistants', 'en-US', 'AI Assistants', 'AI assistants, chat, and LLM clients', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-coding-en', '100001', 'cat-ai-coding', 'en-US', 'AI Coding & Agents', 'AI coding tools and agent platforms', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-creative-en', '100001', 'cat-ai-creative', 'en-US', 'AI Creative & Media', 'AI image, audio, and video creation', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-productivity-en', '100001', 'cat-ai-productivity', 'en-US', 'AI Productivity & Knowledge', 'AI productivity and knowledge-base apps', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-ai-games-en', '100001', 'cat-ai-games', 'en-US', 'AI Agent Games', 'AI-driven agent games', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-board-games-en', '100001', 'cat-board-games', 'en-US', 'Board & Card Games', 'Classic board and card games', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-mini-games-en', '100001', 'cat-mini-games', 'en-US', 'Mini Games', 'Lightweight mini-game collection', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-mobile-games-en', '100001', 'cat-mobile-games', 'en-US', 'Mobile Games', 'Premium mobile games', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('catloc-utilities-en', '100001', 'cat-utilities', 'en-US', 'Utilities', 'Essential desktop utilities', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = EXCLUDED.updated_at;

-- Bind each listing to its primary category for catalog filters.
INSERT INTO appstore_listing_category_binding
    (id, tenant_id, listing_id, category_id, is_primary, created_at)
SELECT
    'lcb-' || l.id,
    l.tenant_id,
    l.id,
    l.primary_category_id,
    1,
    CURRENT_TIMESTAMP
FROM appstore_listing l
WHERE l.tenant_id = '100001'
  AND l.primary_category_id IS NOT NULL
  AND l.primary_category_id <> ''
ON CONFLICT (id) DO NOTHING;

-- Approved compliance profile for every published listing.
INSERT INTO appstore_compliance_profile
    (id, tenant_id, organization_id, listing_id, compliance_version, privacy_nutrition_json, content_rating_questionnaire_json, data_safety_json, target_audience_json, compliance_status, reviewed_by, reviewed_at, created_at, updated_at)
SELECT
    'compliance-' || l.id,
    l.tenant_id,
    l.organization_id,
    l.id,
    1,
    '{"dataCollected": ["usage", "diagnostics"], "dataLinkedToUser": false}',
    '{"ageRating": "' || l.age_rating_code || '"}',
    '{"encryptionInTransit": true, "encryptionAtRest": true}',
    '{"audience": "general"}',
    'approved',
    'seed-bootstrap',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_listing l
WHERE l.tenant_id = '100001'
  AND l.listing_status = 'published'
ON CONFLICT (id) DO NOTHING;

-- Default regional availability for CN and US storefronts.
INSERT INTO appstore_regional_availability
    (id, tenant_id, organization_id, listing_id, region_code, availability_status, effective_at, expires_at, created_at, updated_at)
SELECT
    'region-' || l.id || '-cn',
    l.tenant_id,
    l.organization_id,
    l.id,
    'CN',
    'available',
    CURRENT_TIMESTAMP,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_listing l
WHERE l.tenant_id = '100001'
  AND l.listing_status = 'published'
ON CONFLICT (id) DO NOTHING;

INSERT INTO appstore_regional_availability
    (id, tenant_id, organization_id, listing_id, region_code, availability_status, effective_at, expires_at, created_at, updated_at)
SELECT
    'region-' || l.id || '-us',
    l.tenant_id,
    l.organization_id,
    l.id,
    'US',
    'available',
    CURRENT_TIMESTAMP,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_listing l
WHERE l.tenant_id = '100001'
  AND l.listing_status = 'published'
ON CONFLICT (id) DO NOTHING;

-- Link published releases to the SDKWork PC market channel.
INSERT INTO appstore_market_release
    (id, tenant_id, organization_id, app_id, listing_id, release_id, channel_id, market_release_no, external_app_id, external_release_id, external_track, market_status, rollout_percent, countries_json, store_url, external_status_json, submitted_at, approved_at, released_at, rejected_at, last_synced_at, created_at, updated_at)
SELECT
    'mrel-' || r.id,
    r.tenant_id,
    r.organization_id,
    l.app_id,
    r.listing_id,
    r.id,
    'mch-sdkwork-pc',
    'MR-' || UPPER(REPLACE(r.id, '-', '')),
    l.app_key,
    r.version_code,
    'production',
    'released',
    100,
    '["CN", "US"]',
    'https://appstore.sdkwork.local/apps/' || l.listing_slug,
    '{"syncState": "seeded"}',
    r.submitted_at,
    r.approved_at,
    r.published_at,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_release r
JOIN appstore_listing l
  ON l.id = r.listing_id
 AND l.tenant_id = r.tenant_id
WHERE r.tenant_id = '100001'
  AND r.release_status = 'published'
ON CONFLICT (id) DO NOTHING;

-- Ensure review threads and media references are populated for storefront listings.
UPDATE appstore_listing
SET comments_thread_id = 'thread-' || id
WHERE tenant_id = '100001'
  AND (comments_thread_id IS NULL OR comments_thread_id = '');

UPDATE appstore_category
SET icon_media_resource_id = 'mr-' || id || '-icon'
WHERE tenant_id = '100001'
  AND (icon_media_resource_id IS NULL OR icon_media_resource_id = '');

UPDATE appstore_catalog_collection
SET cover_media_resource_id = 'mr-col-' || collection_code || '-cover'
WHERE tenant_id = '100001'
  AND (cover_media_resource_id IS NULL OR cover_media_resource_id = '');
