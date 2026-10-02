import { createContext, useContext } from 'react'
import type { AppItem } from '@sdkwork/appstore-pc-core'

/** Install actions and library state consumed by storefront cards. */
export interface AppstoreInstallApi {
  /**
   * Start the install flow for a listing; the distribution decides the shape
   * (web apps open in a new window, mobile/mini-program listings show the QR
   * dialog, desktop listings open the install modal). `platform` forces the
   * recorded platform code, e.g. from an explicit "Download for macOS" button.
   */
  installApp: (app: AppItem, platform?: string) => void
  openApp: (app: AppItem) => void
  uninstallApp: (appId: string) => void
  isInstalled: (appId: string) => boolean
  isDownloading: (appId: string) => boolean
  downloadProgress: (appId: string) => number
  installedAppIds: Set<string>
  activeDownloadApp: AppItem | null
  downloadState: 'confirm' | 'downloading' | 'success' | null
  /** Open the scan-to-continue dialog for a mobile/mini-program distribution. */
  requestQr: (app: AppItem) => void
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
