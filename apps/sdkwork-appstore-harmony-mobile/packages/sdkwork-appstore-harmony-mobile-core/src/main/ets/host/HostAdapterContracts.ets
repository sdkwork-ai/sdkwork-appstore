/**
 * Typed host adapter contracts for the HarmonyOS runtime.
 *
 * Authority: `APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1 — host-only
 * capabilities cross the platform boundary through contracts, never through
 * direct platform API calls inside capability packages.
 */
export interface AppstoreStorageHostAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

export interface AppstoreHapticHostAdapter {
  light(): void;
  medium(): void;
  heavy(): void;
}

export interface AppstoreShareHostAdapter {
  share(payload: { title: string; url: string }): Promise<void>;
}
