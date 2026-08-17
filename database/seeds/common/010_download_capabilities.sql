-- 010_download_capabilities.sql
-- Initialize release artifacts, entitlements, download grants and install events
-- for end-to-end download capability flows.

-- 1) Seed one verified desktop artifact for every published release.
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
    created_at,
    updated_at
)
SELECT
    'artifact-' || r.id,
    r.tenant_id,
    r.organization_id,
    r.id,
    'ART-' || UPPER(REPLACE(r.id, '-', '')),
    'windows',
    'x86_64',
    'msi',
    'verified',
    'drive://appstore/' || r.listing_id || '/releases/' || r.version_code || '/windows-x86_64.msi',
    'mr-artifact-' || r.id,
    CAST(52428800 + (ABS(HASHTEXT(r.id)) % 524288001) AS TEXT),
    'application/x-msi',
    md5(r.id || ':' || r.version_code || ':' || r.listing_id),
    '{"signer":"sdkwork-appstore-release-service","algorithm":"sha256","keyId":"seed-ed25519-2026","signedAt":"2026-08-03T00:00:00Z"}',
    NULL,
    NULL,
    COALESCE(r.minimum_os_version, '10.0'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_release r
WHERE r.tenant_id = '100001'
  AND r.release_status = 'published'
ON CONFLICT (id) DO NOTHING;

-- 2) Seed paid entitlements for the demo user so entitlement-gated
-- download flow is testable.
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

-- 3) Seed active grants for published listings so complete download
-- grant flow can be validated across pricing models.
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
    'grant-' || a.id,
    a.tenant_id,
    a.organization_id,
    'DLG-' || UPPER(REPLACE(r.id, '-', '')),
    r.listing_id,
    r.id,
    a.id,
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
FROM appstore_release_artifact a
JOIN appstore_release r
  ON r.id = a.release_id
 AND r.tenant_id = a.tenant_id
JOIN appstore_listing l
  ON l.id = r.listing_id
 AND l.tenant_id = r.tenant_id
WHERE a.tenant_id = '100001'
  AND a.artifact_status = 'verified'
  AND l.listing_status = 'published'
ON CONFLICT (id) DO NOTHING;

-- 4) Seed completed install events to cover download->install telemetry path.
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
    'dev-pc-001',
    'install',
    'pc',
    'x64',
    'succeeded',
    'storefront',
    '1.0.0',
    'CN',
    '{"source":"seed-010","path":"download-grant-install"}',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM appstore_download_grant g
WHERE g.tenant_id = '100001'
ON CONFLICT (id) DO NOTHING;
