-- 013_app_platform_delivery.sql — per-platform scan/delivery links
-- (locale-neutral).
--
-- Populates appstore_app_platform for every storefront app that ships a
-- mobile, mini-program, or browser-extension distribution, so QR codes can
-- point at platform-specific landing pages instead of the generic access
-- URL. Desktop distributions keep the installer-artifact flow and are not
-- seeded here.

INSERT INTO appstore_app_platform (
    id, tenant_id, organization_id, app_id, platform_code, platform_status,
    package_identity, distribution_mode, config_json, created_at, updated_at
)
SELECT
    'appplat-' || a.id || '-' || p.code,
    a.tenant_id,
    a.organization_id,
    a.id,
    p.code,
    'active',
    'com.sdkwork.' || a.id || '.' || p.code,
    'external',
    jsonb_build_object(
        'qrUrl',
        CASE
            WHEN p.code LIKE 'miniprogram-%'
                THEN 'https://apps.sdkwork.com/mp/' || p.code || '/' || a.id
            ELSE 'https://apps.sdkwork.com/m/' || a.id
        END
    ),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_app a
CROSS JOIN LATERAL jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
WHERE a.tenant_id = '100001'
  AND a.platforms::jsonb != '[]'::jsonb
  AND (
    p.code IN ('android', 'ios', 'harmonyos')
    OR p.code LIKE 'miniprogram-%'
    OR p.code LIKE 'browser-extension-%'
  )
ON CONFLICT (id) DO NOTHING;
