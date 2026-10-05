import { coalesce } from '@sdkwork/utils';

export interface LibraryUpdateRow {
  id: string;
  appName: string;
  currentVersion: string;
  newVersion: string;
  size: string;
  releaseDate: string;
  artifactId: string;
  releaseId: string;
  appKey: string;
  listingSlug: string;
  /** Platform the library row was installed for (drives the update install). */
  platform: string;
  security: boolean;
  iconUrl?: string;
}

export function formatByteSize(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(1)} MB`;
    }
    if (value >= 1_000) {
      return `${Math.round(value / 1_000)} KB`;
    }
    return `${value} B`;
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  return '—';
}

function readString(record: Record<string, unknown>, ...keys: string[]): string {
  const values = keys.map((key) => {
    const value = record[key];
    return typeof value === 'string' ? value : undefined;
  });
  return coalesce(...values) ?? '';
}

export function mapLibraryUpdateRow(
  update: unknown,
  index: number,
  libraryItems: unknown[],
): LibraryUpdateRow {
  const row = (update ?? {}) as Record<string, unknown>;
  const appKey = readString(row, 'appKey', 'app_key');
  const libraryMatch = libraryItems.find((entry) => {
    const libraryRow = (entry ?? {}) as Record<string, unknown>;
    return readString(libraryRow, 'appKey', 'app_key') === appKey;
  });
  const libraryRecord = (libraryMatch ?? {}) as Record<string, unknown>;
  const appName =
    readString(libraryRecord, 'displayName', 'display_name') ||
    readString(libraryRecord, 'listingId', 'listing_id') ||
    appKey ||
    `应用 ${index + 1}`;
  const artifactId = readString(row, 'artifactId', 'artifact_id');
  const releaseId = readString(row, 'releaseId', 'release_id');

  return {
    id: artifactId || releaseId || `${index}`,
    appName,
    currentVersion: readString(row, 'installedVersionCode', 'installed_version_code') || '—',
    newVersion: readString(row, 'latestVersionName', 'latest_version_name') || '—',
    size: formatByteSize(row.fileSizeBytes ?? row.file_size_bytes),
    releaseDate: readString(row, 'releaseDate', 'release_date', 'publishedAt', 'published_at') || '—',
    artifactId,
    releaseId,
    appKey,
    listingSlug:
      readString(libraryRecord, 'listingSlug', 'listing_slug') ||
      readString(libraryRecord, 'listingId', 'listing_id') ||
      appKey,
    platform:
      readString(libraryRecord, 'platform') ||
      readString(row, 'platform') ||
      'h5',
    security: Boolean(row.securityPatch ?? row.security_patch ?? row.isSecurityUpdate),
    iconUrl: readString(libraryRecord, 'iconMediaResourceId', 'icon_media_resource_id', 'iconUrl') || undefined,
  };
}
