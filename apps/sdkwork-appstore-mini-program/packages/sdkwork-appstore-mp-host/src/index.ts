/**
 * Mini program host adapters.
 *
 * Host-only capabilities are registered here and exposed through typed
 * contracts so capability packages stay platform-agnostic
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */

export interface StorageHostAdapter {
  read(key: string): string | null;
  write(key: string, value: string): void;
  remove(key: string): void;
}

export interface HapticHostAdapter {
  light(): void;
  medium(): void;
  heavy(): void;
}

const registered = new Set<string>();

export function registerMiniProgramHostAdapters(): readonly string[] {
  registered.add("storage");
  registered.add("haptic");
  registered.add("share");
  return listMiniProgramHostAdapters();
}

export function listMiniProgramHostAdapters(): readonly string[] {
  return [...registered].sort();
}

export function isMiniProgramHostAdapterAvailable(name: string): boolean {
  return registered.has(name);
}
