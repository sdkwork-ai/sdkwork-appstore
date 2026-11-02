-- 013_app_platform_delivery.sql — per-platform scan/preview delivery rows
-- (locale-neutral).
--
-- Owns the seeded `appstore_app_platform` matrix. Every application platform a
-- listing ships that is reached by scanning a code gets exactly one row:
--   * mobile store lanes (android/ios/ipados/harmonyos) — install landing page
--   * H5 mobile web (h5) — mobile preview of the same app, scanned from the PC
--     storefront; this is the H5 "scan to preview" capability and previously
--     had no row at all, so H5 listings fell back to the desktop access URL
--   * mini programs (miniprogram-*) — mini program landing page
--   * browser extensions (browser-extension-*) — extension install page
-- Desktop installers (windows/macos/linux) and the PC web surface (web) are
-- not scan targets: the storefront downloads or opens them directly.
--
-- `config_json.qrUrl` is the scan target read by the catalog API
-- (`ListingSummary.platformLinks`, catalog_repository.rs) and by the PC
-- storefront distribution actions (`platformLinks[code]`), so it is the single
-- value every scan surface consumes.
--
-- Rows are seeded, not user data: the scannable platform lanes of a seeded
-- catalog application are owned by this file and are rebuilt on every apply so
-- a platform the listing stopped shipping does not keep a stale scan target.
BEGIN;

DELETE FROM appstore_app_platform p
USING appstore_app a
WHERE p.tenant_id = '100001'
  AND a.tenant_id = '100001'
  AND p.app_id = a.id
  AND (
      p.id LIKE 'appplat-%'
      OR p.platform_code IN ('android', 'ios', 'ipados', 'harmonyos', 'h5')
      OR p.platform_code LIKE 'miniprogram-%'
      OR p.platform_code LIKE 'browser-extension-%'
  );

INSERT INTO appstore_app_platform (
    id, tenant_id, organization_id, app_id, platform_code, platform_status,
    package_identity, min_os_version, supported_architectures, device_families,
    distribution_mode, config_json, created_at, updated_at
)
SELECT
    'appplat-' || a.id || '-' || p.code,
    a.tenant_id,
    a.organization_id,
    a.id,
    p.code,
    'active',
    CASE
        WHEN p.code = 'android'
            THEN COALESCE(NULLIF(TRIM(a.package_name), ''), 'com.sdkwork.' || REPLACE(a.id, '-', '.'))
        WHEN p.code IN ('ios', 'ipados')
            THEN COALESCE(NULLIF(TRIM(a.bundle_id), ''), 'com.sdkwork.' || REPLACE(a.id, '-', '.'))
        WHEN p.code = 'harmonyos'
            THEN COALESCE(NULLIF(TRIM(a.package_name), ''), 'com.sdkwork.' || REPLACE(a.id, '-', '.'))
        WHEN p.code LIKE 'miniprogram-%'
            THEN 'wx' || SUBSTRING(MD5(a.id || ':' || p.code), 1, 16)
        WHEN p.code LIKE 'browser-extension-%'
            THEN 'sdkwork-' || REPLACE(a.id, '-', '') || '-' || p.code
        ELSE COALESCE(NULLIF(TRIM(a.access_url), ''), 'https://apps.sdkwork.com/' || a.id || '/')
    END,
    CASE
        WHEN p.code = 'android' THEN '8.0'
        WHEN p.code IN ('ios', 'ipados') THEN '15.0'
        WHEN p.code = 'harmonyos' THEN '5.0'
        ELSE NULL
    END,
    CASE
        WHEN p.code = 'android' THEN '["arm64", "x64"]'::jsonb
        WHEN p.code IN ('ios', 'ipados', 'h5') THEN '["universal"]'::jsonb
        WHEN p.code = 'harmonyos' THEN '["arm64"]'::jsonb
        WHEN p.code LIKE 'miniprogram-%' THEN '["universal"]'::jsonb
        WHEN p.code LIKE 'browser-extension-%' THEN '["universal"]'::jsonb
        ELSE '["universal"]'::jsonb
    END,
    CASE
        WHEN p.code = 'android' THEN '["phone", "tablet"]'::jsonb
        WHEN p.code = 'ios' THEN '["phone"]'::jsonb
        WHEN p.code = 'ipados' THEN '["tablet"]'::jsonb
        WHEN p.code = 'harmonyos' THEN '["phone", "tablet"]'::jsonb
        WHEN p.code = 'h5' THEN '["phone", "tablet"]'::jsonb
        WHEN p.code LIKE 'miniprogram-%' THEN '["mini-program"]'::jsonb
        WHEN p.code LIKE 'browser-extension-%' THEN '["browser"]'::jsonb
        ELSE '["browser"]'::jsonb
    END,
    CASE
        WHEN p.code IN ('android', 'ios', 'ipados', 'harmonyos') THEN 'store'
        ELSE 'external'
    END,
    jsonb_build_object(
        'qrUrl',
        CASE
            WHEN p.code = 'h5'
                THEN COALESCE(NULLIF(TRIM(a.access_url), ''), 'https://apps.sdkwork.com/m/' || a.id)
            WHEN p.code LIKE 'miniprogram-%'
                THEN 'https://apps.sdkwork.com/mp/' || p.code || '/' || a.id
            WHEN p.code LIKE 'browser-extension-%'
                THEN 'https://apps.sdkwork.com/ext/' || p.code || '/' || a.id
            ELSE 'https://apps.sdkwork.com/m/' || a.id || '/' || p.code
        END,
        'previewUrl',
        CASE
            WHEN p.code = 'h5'
                THEN COALESCE(NULLIF(TRIM(a.access_url), ''), 'https://apps.sdkwork.com/m/' || a.id)
            WHEN p.code LIKE 'miniprogram-%'
                THEN 'https://apps.sdkwork.com/mp/' || p.code || '/' || a.id
            WHEN p.code LIKE 'browser-extension-%'
                THEN 'https://apps.sdkwork.com/ext/' || p.code || '/' || a.id
            ELSE 'https://apps.sdkwork.com/m/' || a.id || '/' || p.code
        END,
        'scanKind',
        CASE
            WHEN p.code = 'h5' THEN 'h5'
            WHEN p.code LIKE 'miniprogram-%' THEN 'miniprogram'
            WHEN p.code LIKE 'browser-extension-%' THEN 'browser-extension'
            ELSE 'mobile'
        END,
        'distributionMode',
        CASE
            WHEN p.code IN ('android', 'ios', 'ipados', 'harmonyos') THEN 'store'
            ELSE 'external'
        END
    ),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_app a
CROSS JOIN LATERAL jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
WHERE a.tenant_id = '100001'
  AND jsonb_array_length(a.platforms::jsonb) > 0
  AND (
      p.code IN ('android', 'ios', 'ipados', 'harmonyos', 'h5')
      OR p.code LIKE 'miniprogram-%'
      OR p.code LIKE 'browser-extension-%'
  )
ON CONFLICT (id) DO UPDATE SET
    platform_status = EXCLUDED.platform_status,
    package_identity = EXCLUDED.package_identity,
    min_os_version = EXCLUDED.min_os_version,
    supported_architectures = EXCLUDED.supported_architectures,
    device_families = EXCLUDED.device_families,
    distribution_mode = EXCLUDED.distribution_mode,
    config_json = EXCLUDED.config_json,
    updated_at = EXCLUDED.updated_at;

COMMIT;
