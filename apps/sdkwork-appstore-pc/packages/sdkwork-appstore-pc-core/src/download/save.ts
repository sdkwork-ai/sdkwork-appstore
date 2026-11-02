/**
 * Local hand-off for a completed installer download.
 *
 * The bytes live in the renderer (IndexedDB) after the transfer finishes, so
 * the storefront has to place them on the user's disk. Inside the BirdCoder
 * desktop shell the trusted-window save bridge writes the file to Downloads and
 * reports the path; in a plain browser the same blob is handed to a detached
 * anchor download. Both paths are local and never re-fetch the installer.
 */

/** Minimal structural view of the desktop shell's trusted save bridge. */
export interface DownloadSaveBridge {
  fileActions?: {
    save(request: {
      url: string
      name?: string
      mediaType?: string
      mode: 'download' | 'saveAs'
    }): Promise<{ status: 'saved' | 'cancelled'; path?: string }>
  }
}

/** Runtime hooks used by the save helper (injectable for tests). */
export interface DownloadSaveEnvironment {
  /** Desktop bridge, when the page is hosted by the native shell. */
  bridge?: DownloadSaveBridge
  /** Object-URL factory. */
  createObjectUrl?: (blob: Blob) => string
  /** Object-URL disposer. */
  revokeObjectUrl?: (url: string) => void
  /** Document used for the anchor fallback. */
  document?: Document
}

/** Result of placing a completed download on local storage. */
export interface DownloadSaveResult {
  status: 'saved' | 'cancelled' | 'unavailable'
  /** How the file reached local storage. */
  method?: 'desktop' | 'browser'
  /** Absolute path when the desktop shell reports one. */
  path?: string
}

const REVOKE_DELAY_MS = 60_000

interface ResolvedSaveEnvironment {
  bridge?: DownloadSaveBridge
  createObjectUrl?: (blob: Blob) => string
  revokeObjectUrl?: (url: string) => void
  document?: Document
}

function resolveEnvironment(environment: DownloadSaveEnvironment | undefined): ResolvedSaveEnvironment {
  const scope = environment ?? (typeof globalThis === 'undefined' ? {} : (globalThis as DownloadSaveEnvironment))
  const browserUrl = typeof URL === 'undefined' ? undefined : URL
  const nativeBridge =
    environment === undefined && typeof globalThis !== 'undefined'
      ? (globalThis as { dshDesktop?: DownloadSaveBridge }).dshDesktop
      : undefined
  return {
    bridge: scope.bridge ?? nativeBridge,
    createObjectUrl:
      scope.createObjectUrl
      ?? (browserUrl === undefined ? undefined : (blob) => browserUrl.createObjectURL(blob)),
    revokeObjectUrl:
      scope.revokeObjectUrl
      ?? (browserUrl === undefined ? undefined : (url) => {
        browserUrl.revokeObjectURL(url)
      }),
    document: scope.document ?? (typeof document === 'undefined' ? undefined : document),
  }
}

/**
 * Save a completed installer download to local storage.
 * @param blob - assembled installer bytes.
 * @param fileName - file name proposed to the user.
 * @param environment - optional runtime hooks.
 * @returns how the file was saved, or that no local destination exists.
 */
export async function saveDownloadedFile(
  blob: Blob,
  fileName: string,
  environment?: DownloadSaveEnvironment,
): Promise<DownloadSaveResult> {
  const runtime = resolveEnvironment(environment)
  const createObjectUrl = runtime.createObjectUrl
  if (createObjectUrl === undefined) {
    return { status: 'unavailable' }
  }

  const objectUrl = createObjectUrl(blob)
  try {
    const desktop = runtime.bridge?.fileActions
    if (desktop !== undefined) {
      try {
        const result = await desktop.save({
          url: objectUrl,
          name: fileName,
          mediaType: blob.type || 'application/octet-stream',
          mode: 'download',
        })
        runtime.revokeObjectUrl?.(objectUrl)
        if (result.status === 'cancelled') {
          return { status: 'cancelled', method: 'desktop' }
        }
        return {
          status: 'saved',
          method: 'desktop',
          ...(result.path === undefined ? {} : { path: result.path }),
        }
      } catch {
        // The bridge may reject an origin or a path; the browser anchor still
        // saves the same bytes, so fall through instead of failing the install.
      }
    }

    const document = runtime.document
    if (document === undefined || document.body === null) {
      return { status: 'unavailable' }
    }
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = fileName
    anchor.rel = 'noopener'
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    scheduleRevoke(objectUrl, runtime.revokeObjectUrl)
    return { status: 'saved', method: 'browser' }
  } finally {
    // The desktop bridge reads the URL asynchronously; revoking immediately
    // would race it, so only the anchor path schedules disposal.
  }
}

function scheduleRevoke(objectUrl: string, revoke: ((url: string) => void) | undefined): void {
  if (revoke === undefined) return
  if (typeof setTimeout !== 'function') {
    revoke(objectUrl)
    return
  }
  setTimeout(() => {
    revoke(objectUrl)
  }, REVOKE_DELAY_MS)
}
