import { createContext, useContext } from 'react'
import type { AppItem } from '@sdkwork/appstore-pc-core'

/** Install actions and library state consumed by storefront cards. */
export interface AppstoreInstallApi {
  installApp: (app: AppItem) => void
  openApp: (app: AppItem) => void
  uninstallApp: (appId: string) => void
  isInstalled: (appId: string) => boolean
  isDownloading: (appId: string) => boolean
  downloadProgress: (appId: string) => number
  installedAppIds: Set<string>
  activeDownloadApp: AppItem | null
  downloadState: 'confirm' | 'downloading' | 'success' | null
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
