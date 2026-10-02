export interface StorageStats {
  usedMb: number;
  totalMb: number;
  appsCount: number;
  cacheMb: number;
}

export interface IInstallSDK {
  getInstalledAppIds(): Promise<string[]>;
  /**
   * Record an install of a listing on the given platform.
   * @param appId - the listing id.
   * @param platform - raw platform code (windows/macos/linux/android/...);
   *   defaults to the PC storefront context when omitted.
   */
  installApp(appId: string, platform?: string): Promise<boolean>;
  uninstallApp(appId: string): Promise<boolean>;
  getStorageStats(): Promise<StorageStats>;
}

export type InstallServicePort = IInstallSDK;

let installPort: InstallServicePort = createUnconfiguredInstallPort();

/** Bind the real SDK-backed implementation during app bootstrap. */
export function configureInstallServicePort(port: InstallServicePort): void {
  installPort = port;
}

export const InstallService: IInstallSDK = {
  getInstalledAppIds: () => installPort.getInstalledAppIds(),
  installApp: (appId, platform) => installPort.installApp(appId, platform),
  uninstallApp: (appId) => installPort.uninstallApp(appId),
  getStorageStats: () => installPort.getStorageStats(),
};

function createUnconfiguredInstallPort(): InstallServicePort {
  const unavailable = (): never => {
    throw new Error('The App Store install runtime is not configured.');
  };
  return {
    getInstalledAppIds: async () => unavailable(),
    installApp: async () => unavailable(),
    uninstallApp: async () => unavailable(),
    getStorageStats: async () => unavailable(),
  };
}
