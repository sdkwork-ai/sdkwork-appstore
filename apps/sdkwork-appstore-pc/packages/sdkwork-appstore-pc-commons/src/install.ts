import { createContext, useContext } from 'react'
import type {
  AppItem,
  AppPlatformGroupKey,
  HostPlatform,
  InstallSelection,
  InstallVariant,
} from '@sdkwork/appstore-pc-core'

/** Install actions and library state consumed by storefront cards. */
export interface AppstoreInstallApi {
  /**
   * Start the install flow for a listing; the distribution decides the shape
   * (web apps open in a new window, mobile/mini-program listings show the QR
   * dialog, desktop listings open the install modal). A `selection` forces one
   * explicit build — the platform, CPU architecture, and release artifact the
   * builds menu resolved — and always takes the desktop install path.
   */
  installApp: (app: AppItem, selection?: InstallSelection) => void
  /**
   * Download one release artifact as a file without recording an install.
   * Used for builds of another operating system or an architecture this host
   * cannot run: the page still has to serve every published build, but a
   * foreign file must not enter this machine's installed library.
   */
  downloadBuild: (app: AppItem, variant: InstallVariant) => void
  /** Artifact id whose download grant is in flight, for per-row spinners. */
  downloadingArtifactId: string | null
  openApp: (app: AppItem) => void
  uninstallApp: (appId: string) => void
  isInstalled: (appId: string) => boolean
  isDownloading: (appId: string) => boolean
  downloadProgress: (appId: string) => number
  installedAppIds: Set<string>
  activeDownloadApp: AppItem | null
  downloadState: 'confirm' | 'downloading' | 'success' | null
  /**
   * Host desktop OS and CPU architecture detected for this browser, refined by
   * the User-Agent Client Hints when available. Consumers choose the build and
   * the call-to-action state from the same snapshot the install flow uses.
   */
  host: HostPlatform
  /**
   * Open the scan-to-continue dialog for a mobile/mini-program distribution.
   * `group` labels the dialog with the scanned platform when triggered from a
   * per-platform scan button.
   */
  requestQr: (app: AppItem, group?: AppPlatformGroupKey) => void
}

/** React context filled by the product `InstallProvider`. */
export const AppstoreInstallContext = createContext<AppstoreInstallApi | undefined>(undefined)

/**
 * Read the active install API.
 * @returns the install actions registered by `InstallProvider`.
 */
export function useInstall(): AppstoreInstallApi {
  const context = useContext(AppstoreInstallContext)
  if (context === undefined) {
    throw new Error('useInstall must be used within an InstallProvider')
  }
  return context
}
