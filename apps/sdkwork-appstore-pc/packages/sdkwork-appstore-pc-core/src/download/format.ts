/**
 * Display and filename helpers for the download center.
 */

const FORMAT_EXTENSIONS: Record<string, string> = {
  msix: 'msix',
  exe: 'exe',
  zip: 'zip',
  dmg: 'dmg',
  pkg: 'pkg',
  appimage: 'AppImage',
  deb: 'deb',
  rpm: 'rpm',
  tar_gz: 'tar.gz',
  'tar.gz': 'tar.gz',
}

/** File extension for a package format code. */
export function installerExtension(packageFormat: string | null | undefined): string {
  const normalized = packageFormat?.trim().toLowerCase() ?? ''
  return FORMAT_EXTENSIONS[normalized] ?? (normalized || 'bin')
}

/**
 * Build the saved installer file name.
 * @param input - listing and build identity.
 * @returns a filesystem-safe name ending in the package extension.
 */
export function installerFileName(input: {
  appName: string
  appVersion?: string | null
  platform: string
  architecture?: string | null
  packageFormat?: string | null
}): string {
  const stem = [input.appName, input.appVersion ?? '', input.platform, input.architecture ?? '']
    .map((part) => sanitizeFileStem(part))
    .filter((part) => part !== '')
    .join('-')
  const base = stem || 'installer'
  return `${base}.${installerExtension(input.packageFormat)}`
}

/** Strip characters that are illegal or unsafe in a file name. */
function sanitizeFileStem(value: string): string {
  return value
    .replace(/[<>:"/\\|?*\u0000-\u001f]/gu, ' ')
    .replace(/\s+/gu, ' ')
    .trim()
    .replace(/[. ]+$/u, '')
    .slice(0, 80)
}

/**
 * Human-readable byte count.
 * @param bytes - byte count, or null while unknown.
 * @returns a compact `B`/`KB`/`MB`/`GB` label.
 */
export function formatDownloadBytes(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
    return '—'
  }
  if (bytes < 1024) {
    return `${Math.round(bytes)} B`
  }
  const kilobytes = bytes / 1024
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes >= 100 ? 0 : 1)} KB`
  }
  const megabytes = kilobytes / 1024
  if (megabytes < 1024) {
    return `${megabytes.toFixed(megabytes >= 100 ? 0 : 1)} MB`
  }
  return `${(megabytes / 1024).toFixed(2)} GB`
}

/**
 * Human-readable transfer speed.
 * @param bytesPerSecond - measured bytes per second.
 * @returns a `B/s`/`KB/s`/`MB/s` label, or an em dash when not measured.
 */
export function formatDownloadSpeed(bytesPerSecond: number | null | undefined): string {
  if (
    bytesPerSecond === null
    || bytesPerSecond === undefined
    || !Number.isFinite(bytesPerSecond)
    || bytesPerSecond <= 0
  ) {
    return '—'
  }
  return `${formatDownloadBytes(bytesPerSecond)}/s`
}

/**
 * Progress percentage of a task.
 * @param receivedBytes - bytes persisted so far.
 * @param totalBytes - expected total, or null when unknown.
 * @returns 0-100; 0 when the total is unknown and no bytes arrived.
 */
export function downloadProgressPercent(
  receivedBytes: number,
  totalBytes: number | null,
): number {
  if (totalBytes !== null && totalBytes > 0) {
    return Math.min(100, Math.max(0, (receivedBytes / totalBytes) * 100))
  }
  return 0
}
