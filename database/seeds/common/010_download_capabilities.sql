-- 010_download_capabilities.sql
-- Initialize the release artifact matrix, paid entitlements, download grants,
-- and install events for end-to-end download capability flows.
--
-- Installer matrix authority
--   A listing ships one installer per operating system it declares in
--   `appstore_app.platforms`, and within one operating system it ships the CPU
--   architectures and package formats of that operating system's distribution
--   convention (APP_MANIFEST_SPEC.md section 10.1, INSTALL package matrix):
--     windows  x64, arm64   exe, msi, zip
--     macos    arm64, x64   dmg, zip
--     linux    x64, arm64   appimage, deb, tar_gz
--     android  arm64, x64   apk, aab
--     ios/ipados universal  ipa
--     harmonyos arm64       hap
--   Web (web/h5) and mini program (miniprogram-*) surfaces are reached by
--   direct open or by scanning a code (see 013_app_platform_delivery.sql); they
--   have no installer and therefore no artifact row. The previous seed gave
--   every published release one Windows MSI, including H5 and mini program
--   listings, which is what this file replaces.
--
-- Seeded artifact, grant, and install-event ids use the `artifact-`, `grant-`,
-- and `install-event-` namespaces owned by this file. They are rebuilt on every
-- apply so the matrix stays aligned with the declared platforms.

BEGIN;

-- Step 1: drop the previous seed-owned download chain before rebuilding it.
-- Events reference grants, and grants reference artifacts, so they are removed
-- in dependency order.
DELETE FROM appstore_install_event
WHERE tenant_id = '100001'
  AND id LIKE 'install-event-%';

DELETE FROM appstore_download_grant
WHERE tenant_id = '100001'
  AND id LIKE 'grant-%';

DELETE FROM appstore_release_artifact
WHERE tenant_id = '100001'
  AND id LIKE 'artifact-%';

-- Step 2: seed the operating-system and CPU-architecture installer matrix for
-- every published release whose listing declares that operating system.
WITH distribution_matrix (
    platform, architecture, package_format, content_type, file_extension, min_os_version
) AS (
    VALUES
        ('windows', 'x64', 'exe', 'application/vnd.microsoft.portable-executable', 'exe', '10.0'),
        ('windows', 'x64', 'msi', 'application/x-msi', 'msi', '10.0'),
        ('windows', 'x64', 'zip', 'application/zip', 'zip', '10.0'),
        ('windows', 'arm64', 'exe', 'application/vnd.microsoft.portable-executable', 'exe', '11.0'),
        ('windows', 'arm64', 'msi', 'application/x-msi', 'msi', '11.0'),
        ('windows', 'arm64', 'zip', 'application/zip', 'zip', '11.0'),
        ('macos', 'arm64', 'dmg', 'application/x-apple-diskimage', 'dmg', '12.0'),
        ('macos', 'arm64', 'zip', 'application/zip', 'zip', '12.0'),
        ('macos', 'x64', 'dmg', 'application/x-apple-diskimage', 'dmg', '12.0'),
        ('macos', 'x64', 'zip', 'application/zip', 'zip', '12.0'),
        ('linux', 'x64', 'appimage', 'application/vnd.appimage', 'AppImage', '22.04'),
        ('linux', 'x64', 'deb', 'application/vnd.debian.binary-package', 'deb', '22.04'),
        ('linux', 'x64', 'tar_gz', 'application/gzip', 'tar.gz', '22.04'),
        ('linux', 'arm64', 'appimage', 'application/vnd.appimage', 'AppImage', '22.04'),
        ('linux', 'arm64', 'deb', 'application/vnd.debian.binary-package', 'deb', '22.04'),
        ('linux', 'arm64', 'tar_gz', 'application/gzip', 'tar.gz', '22.04'),
        ('android', 'arm64', 'apk', 'application/vnd.android.package-archive', 'apk', '8.0'),
        ('android', 'arm64', 'aab', 'application/octet-stream', 'aab', '8.0'),
        ('android', 'x64', 'apk', 'application/vnd.android.package-archive', 'apk', '8.0'),
        ('ios', 'universal', 'ipa', 'application/octet-stream', 'ipa', '15.0'),
        ('ipados', 'universal', 'ipa', 'application/octet-stream', 'ipa', '15.0'),
        ('harmonyos', 'arm64', 'hap', 'application/octet-stream', 'hap', '5.0')
),
artifact_source AS (
    SELECT
        r.id AS release_id,
        r.tenant_id,
        r.organization_id,
        r.listing_id,
        r.version_code,
        l.app_key,
        m.platform,
        m.architecture,
        m.package_format,
        m.content_type,
        m.file_extension,
        m.min_os_version,
        'artifact-' || r.id || '-' || m.platform || '-' || m.architecture || '-' || m.package_format AS artifact_id
    FROM appstore_release r
    JOIN appstore_listing l
        ON l.id = r.listing_id
       AND l.tenant_id = r.tenant_id
    JOIN appstore_app a
        ON a.id = l.app_id
       AND a.tenant_id = l.tenant_id
    CROSS JOIN distribution_matrix m
    WHERE r.tenant_id = '100001'
      AND r.release_status = 'published'
      AND a.app_type NOT IN ('NONE', 'SDK')
      AND EXISTS (
          SELECT 1
          FROM jsonb_array_elements_text(a.platforms::jsonb) AS p(code)
          WHERE p.code = m.platform
      )
)
INSERT INTO appstore_release_artifact (
    id,
    tenant_id,
    organization_id,
    release_id,
    artifact_no,
    platform,
    architecture,
    package_format,
    artifact_status,
    drive_node_id,
    media_resource_id,
    file_size_bytes,
    content_type,
    checksum_sha256,
    signature_snapshot_json,
    sbom_ref,
    provenance_ref,
    min_os_version,
    virus_scan_status,
    cdn_url,
    created_at,
    updated_at
)
SELECT
    s.artifact_id,
    s.tenant_id,
    s.organization_id,
    s.release_id,
    'ART-' || UPPER(REPLACE(s.artifact_id, '-', '')),
    s.platform,
    s.architecture,
    s.package_format,
    'verified',
    'drive://appstore/' || s.listing_id || '/releases/' || s.version_code || '/'
        || s.platform || '/' || s.architecture || '/' || s.app_key || '.' || s.file_extension,
    'mr-' || s.artifact_id,
    CAST(
        41943040 + (
            ABS(HASHTEXT(s.artifact_id)::BIGINT) % 471859200
        ) AS TEXT
    ),
    s.content_type,
    ENCODE(sha256(CONVERT_TO(s.artifact_id || ':sha256', 'UTF8')), 'hex'),
    '{"signer":"sdkwork-appstore-release-service","algorithm":"sha256","keyId":"seed-ed25519-2026","signedAt":"2026-08-03T00:00:00Z"}',
    'sbom://appstore/' || s.release_id || '/' || s.platform || '/' || s.architecture,
    'provenance://appstore/' || s.release_id || '/' || s.platform || '/' || s.architecture,
    s.min_os_version,
    'passed',
    'https://cdn.sdkwork.com/appstore/' || s.listing_id || '/' || s.version_code || '/'
        || s.platform || '/' || s.architecture || '/' || s.app_key || '.' || s.file_extension,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM artifact_source s
ON CONFLICT DO NOTHING;

-- Step 3: paid entitlements for the demo user so the entitlement-gated download
-- flow is testable.
INSERT INTO appstore_entitlement (
    id,
    tenant_id,
    organization_id,
    app_id,
    listing_id,
    subject_type,
    subject_id,
    entitlement_type,
    source_type,
    entitlement_status,
    starts_at,
    expires_at,
    grant_snapshot_json,
    revoked_at,
    created_at,
    updated_at
)
SELECT
    'entitlement-' || l.id || '-user-1',
    l.tenant_id,
    l.organization_id,
    l.app_id,
    l.id,
    'user',
    '1',
    'download',
    'purchase',
    'active',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP + INTERVAL '365 days',
    '{"source":"seed-010","plan":"standard"}',
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_listing l
WHERE l.tenant_id = '100001'
  AND l.pricing_model = 'PAID'
ON CONFLICT (id) DO NOTHING;

-- Step 4: an active grant per verified installer so the complete download-grant
-- flow can be validated for every platform and CPU architecture.
INSERT INTO appstore_download_grant (
    id,
    tenant_id,
    organization_id,
    grant_no,
    listing_id,
    release_id,
    artifact_id,
    user_id,
    grant_status,
    grant_reason,
    expires_at,
    consumed_at,
    download_count,
    max_download_count,
    created_at,
    updated_at
)
SELECT
    'grant-' || ar.id,
    ar.tenant_id,
    ar.organization_id,
    'DLG-' || ar.artifact_no,
    r.listing_id,
    r.id,
    ar.id,
    '1',
    'active',
    CASE
      WHEN l.pricing_model = 'PAID' THEN 'entitlement'
      ELSE 'public_release'
    END,
    CURRENT_TIMESTAMP + INTERVAL '30 days',
    NULL,
    0,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_release_artifact ar
JOIN appstore_release r
  ON r.id = ar.release_id
 AND r.tenant_id = ar.tenant_id
JOIN appstore_listing l
  ON l.id = r.listing_id
 AND l.tenant_id = r.tenant_id
WHERE ar.tenant_id = '100001'
  AND ar.artifact_status = 'verified'
  -- `active` is the canonical storefront status (ListingStatus::Active); the
  -- legacy `published` spelling is accepted so databases seeded before the
  -- 005/017 normalization still receive download grants.
  AND l.listing_status IN ('active', 'published')
ON CONFLICT DO NOTHING;

-- Step 5: completed install events covering the download-to-install telemetry
-- path, carrying the real platform and CPU architecture of the build.
INSERT INTO appstore_install_event (
    id,
    tenant_id,
    organization_id,
    event_no,
    listing_id,
    release_id,
    artifact_id,
    user_id,
    device_id,
    event_type,
    platform,
    architecture,
    event_status,
    source_channel,
    client_version,
    region_code,
    payload_snapshot_json,
    occurred_at,
    created_at
)
SELECT
    'install-event-' || g.id,
    g.tenant_id,
    g.organization_id,
    'EVT-' || UPPER(REPLACE(g.id, '-', '')),
    g.listing_id,
    g.release_id,
    g.artifact_id,
    g.user_id,
    'seed-device-' || ar.platform || '-' || ar.architecture,
    'install',
    ar.platform,
    ar.architecture,
    'succeeded',
    'storefront',
    '1.0.0',
    'CN',
    '{"source":"seed-010","path":"download-grant-install"}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_download_grant g
JOIN appstore_release_artifact ar
  ON ar.id = g.artifact_id
 AND ar.tenant_id = g.tenant_id
WHERE g.tenant_id = '100001'
ON CONFLICT (id) DO NOTHING;

COMMIT;
