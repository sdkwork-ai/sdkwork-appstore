-- 018_app_distribution_identity.sql
--
-- Repair the application identity of every seeded catalog row so it describes
-- the distribution the storefront actually delivers.
--
-- Why this seed exists
--   appstore_app.app_type, runtime_family, and runtime_framework were seeded
--   with storefront shorthands ('app', 'PC', 'H5', 'FLUTTER', 'React'). None of
--   those are SDKWork values:
--     * APP_MANIFEST_SPEC.md section 4: appType is a PlusProjectType value
--       (NONE, SDK, PPT, APP_HTML, APP_VUE, APP_FLUTTER, APP_UNIAPP,
--       APP_REACT, APP_UNITY, APP_HARMONY, VIDEO, POSTER).
--     * APP_MANIFEST_SPEC.md section 6: runtime.family is one of
--       web, mobile, desktop, server, cli, mini-program, library, plugin.
--   appstore_app.platforms also carried the code `h5` while the platform
--   dictionary did not declare it.
--
-- Derivation authority
--   The delivery matrix is `appstore_app.platforms`, whose codes come from
--   `appstore_platform_dictionary` (011_platform_dictionary.sql), the same
--   codes the storefront reads in apps/sdkwork-appstore-pc (platforms.ts).
--   The identity triple is derived from that matrix with this precedence:
--     1. any desktop installer (windows/macos/linux)  -> APP_REACT / desktop
--     2. mobile store plus a hosted surface or a mini program -> APP_UNIAPP
--     3. mobile store only (android/ios/ipados) -> APP_FLUTTER / mobile
--     4. HarmonyOS only -> APP_HARMONY / mobile
--     5. mini program only -> APP_UNIAPP / mini-program
--     6. hosted surface only (web -> APP_HTML / web, h5 -> APP_HTML / mobile)
--   Generated workspace rows (016_workspace_applications.sql) already carry the
--   value projected from a real agent.app.config.json. This repair is scoped to
--   rows that still hold a non-canonical value, so a manifest projection always
--   wins and only the legacy curated catalog is derived here.

BEGIN;

-- Step 1: a client row that predates the distribution seed still has an empty
-- platform list. Its application family proves it is a client (not a server),
-- so it is a browser surface. Server rows keep an empty list by design.
UPDATE appstore_app
SET
    platforms = '["web"]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE tenant_id = '100001'
  AND (platforms IS NULL OR platforms::jsonb = '[]'::jsonb)
  AND UPPER(runtime_family) IN ('PC', 'WEB', 'H5', 'APP', 'MOBILE', 'DESKTOP', 'MINI_PROGRAM');

-- Step 2: collapse legacy platform spellings onto the dictionary code. The
-- storefront already normalizes these in its own reader, but the stored matrix
-- is the authority for the artifact and QR seeds, so it is normalized once
-- here instead of in every consumer.
UPDATE appstore_app a
SET
    platforms = mapped.normalized,
    updated_at = CURRENT_TIMESTAMP
FROM (
    SELECT
        source.id,
        COALESCE(
            jsonb_agg(DISTINCT aliased.code ORDER BY aliased.code),
            '[]'::jsonb
        ) AS normalized
    FROM appstore_app source
    CROSS JOIN LATERAL jsonb_array_elements_text(source.platforms::jsonb) AS raw(code)
    CROSS JOIN LATERAL (
        SELECT CASE LOWER(TRIM(raw.code))
            WHEN 'pwa' THEN 'web'
            WHEN 'web-pc' THEN 'web'
            WHEN 'desktop-web' THEN 'web'
            WHEN 'mobile-web' THEN 'h5'
            WHEN 'web-h5' THEN 'h5'
            ELSE LOWER(TRIM(raw.code))
        END AS code
    ) AS aliased
    WHERE source.tenant_id = '100001'
      AND jsonb_array_length(source.platforms::jsonb) > 0
    GROUP BY source.id
) AS mapped
WHERE a.id = mapped.id
  AND a.tenant_id = '100001'
  AND a.platforms::jsonb IS DISTINCT FROM mapped.normalized;

-- Step 3: a hosted web listing must be openable. The AI evaluation surfaces
-- (017_ai_model_benchmark_apps.sql) and the vertical evaluation catalog
-- (015_vertical_evaluation.sql) render inside the storefront and declare no
-- external site, so their access URL is the storefront listing route of the
-- app. Without it the "open" distribution action has no target at all.
UPDATE appstore_app a
SET
    access_url = 'https://apps.sdkwork.com/app/' || a.id,
    updated_at = CURRENT_TIMESTAMP
WHERE a.tenant_id = '100001'
  AND (a.access_url IS NULL OR TRIM(a.access_url) = '')
  AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
      WHERE p.code = 'web'
  );

-- Step 4: derive the canonical identity triple from the normalized matrix.
WITH distribution AS (
    SELECT
        a.id,
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
            WHERE p.code IN ('windows', 'macos', 'linux')
        ) AS has_desktop_installer,
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
            WHERE p.code IN ('android', 'ios', 'ipados')
        ) AS has_mobile_store,
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
            WHERE p.code = 'harmonyos'
        ) AS has_harmonyos,
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
            WHERE p.code IN ('web', 'h5')
        ) AS has_hosted_surface,
        EXISTS (
            SELECT 1
            FROM jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
            WHERE p.code = 'h5'
        ) AS has_h5,
        (
            SELECT COUNT(DISTINCT SPLIT_PART(p.code, '-', 2))
            FROM jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
            WHERE p.code LIKE 'miniprogram-%'
        ) AS miniprogram_vendor_count
    FROM appstore_app a
    WHERE a.tenant_id = '100001'
      AND jsonb_array_length(a.platforms::jsonb) > 0
)
UPDATE appstore_app a
SET
    app_type = CASE
        WHEN d.has_desktop_installer THEN 'APP_REACT'
        WHEN d.has_mobile_store
             AND (d.has_hosted_surface OR d.miniprogram_vendor_count > 0) THEN 'APP_UNIAPP'
        WHEN d.has_mobile_store THEN 'APP_FLUTTER'
        WHEN d.has_harmonyos THEN 'APP_HARMONY'
        WHEN d.miniprogram_vendor_count > 0 THEN 'APP_UNIAPP'
        ELSE 'APP_HTML'
    END,
    runtime_family = CASE
        WHEN d.has_desktop_installer THEN 'desktop'
        WHEN d.has_mobile_store OR d.has_harmonyos THEN 'mobile'
        WHEN d.miniprogram_vendor_count > 0 THEN 'mini-program'
        WHEN d.has_h5 THEN 'mobile'
        ELSE 'web'
    END,
    runtime_framework = CASE
        WHEN d.has_desktop_installer THEN 'react'
        WHEN d.has_mobile_store
             AND (d.has_hosted_surface OR d.miniprogram_vendor_count > 0) THEN 'uni-app'
        WHEN d.has_mobile_store THEN 'flutter'
        WHEN d.has_harmonyos THEN 'harmony-native'
        WHEN d.miniprogram_vendor_count > 1 THEN 'multi-mini-program'
        WHEN d.miniprogram_vendor_count = 1 THEN 'weixin-mini-program'
        WHEN d.has_h5 THEN 'react-h5'
        ELSE 'react'
    END,
    updated_at = CURRENT_TIMESTAMP
FROM distribution d
WHERE a.id = d.id
  AND a.tenant_id = '100001'
  AND (
      a.app_type NOT IN (
          'NONE', 'SDK', 'PPT', 'APP_HTML', 'APP_VUE', 'APP_FLUTTER', 'APP_UNIAPP',
          'APP_REACT', 'APP_UNITY', 'APP_HARMONY', 'VIDEO', 'POSTER'
      )
      OR a.runtime_family NOT IN (
          'web', 'mobile', 'desktop', 'server', 'cli', 'mini-program', 'library', 'plugin'
      )
      OR TRIM(a.runtime_framework) = ''
  );

-- Step 5: rewrite the release distribution snapshot and the release minimum OS
-- from the same matrix. The seeded snapshots all claimed a single `pc` target
-- and every release claimed minimum_os_version 10.0, including iOS and mini
-- program releases. A release that spans several operating systems cannot carry
-- one minimum OS version, so it is NULL rather than a misleading number.
WITH release_distribution AS (
    SELECT
        r.id AS release_id,
        platform_codes.platforms,
        platform_codes.targets,
        (
            SELECT COUNT(*)
            FROM jsonb_array_elements_text(platform_codes.platforms) AS p(code)
            WHERE p.code IN ('windows', 'macos', 'linux', 'android', 'ios', 'ipados', 'harmonyos')
        ) AS operating_system_count,
        (
            SELECT MIN(
                CASE
                    WHEN p.code = 'windows' THEN '10.0'
                    WHEN p.code = 'macos' THEN '12.0'
                    WHEN p.code = 'linux' THEN '22.04'
                    WHEN p.code = 'android' THEN '8.0'
                    WHEN p.code IN ('ios', 'ipados') THEN '15.0'
                    WHEN p.code = 'harmonyos' THEN '5.0'
                    ELSE NULL
                END
            )
            FROM jsonb_array_elements_text(platform_codes.platforms) AS p(code)
        ) AS operating_system_min_version
    FROM appstore_release r
    JOIN appstore_listing l
        ON l.id = r.listing_id
       AND l.tenant_id = r.tenant_id
    JOIN appstore_app a
        ON a.id = l.app_id
       AND a.tenant_id = l.tenant_id
    CROSS JOIN LATERAL (
        SELECT
            COALESCE(a.platforms::jsonb, '[]'::jsonb) AS platforms,
            COALESCE((
                SELECT jsonb_agg(DISTINCT target.code ORDER BY target.code)
                FROM jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
                CROSS JOIN LATERAL (
                    SELECT CASE
                        WHEN p.code IN ('windows', 'macos', 'linux') THEN 'pc'
                        WHEN p.code IN ('android', 'ios', 'ipados', 'harmonyos') THEN 'mobile'
                        WHEN p.code LIKE 'miniprogram-%' THEN 'miniprogram'
                        WHEN p.code = 'h5' THEN 'h5'
                        ELSE 'web'
                    END AS code
                ) AS target
            ), '[]'::jsonb) AS targets
    ) AS platform_codes
    WHERE r.tenant_id = '100001'
)
UPDATE appstore_release r
SET
    manifest_snapshot_json = (
        CASE
            WHEN r.manifest_snapshot_json IS NULL OR TRIM(r.manifest_snapshot_json) = ''
                THEN '{}'::jsonb
            ELSE r.manifest_snapshot_json::jsonb
        END
        || jsonb_build_object('targets', rd.targets, 'platforms', rd.platforms)
    )::text,
    minimum_os_version = CASE
        WHEN rd.operating_system_count = 1 THEN rd.operating_system_min_version
        ELSE NULL
    END,
    updated_at = CURRENT_TIMESTAMP
FROM release_distribution rd
WHERE r.id = rd.release_id
  AND r.tenant_id = '100001'
  -- Only the legacy seed projection (every release claimed 10.0) is repaired;
  -- a release whose minimum OS was already projected is left untouched.
  AND r.minimum_os_version = '10.0';

COMMIT;
