/**
 * HarmonyOS host adapters.
 *
 * Host-only capabilities are registered here behind typed contracts so
 * capability packages stay platform-agnostic
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
const registered: Set<string> = new Set<string>();

export function registerHarmonyHostAdapters(): string[] {
  registered.add('preferences');
  registered.add('haptic');
  registered.add('share');
  registered.add('deep-link');
  return listHarmonyHostAdapters();
}

export function listHarmonyHostAdapters(): string[] {
  return Array.from(registered).sort();
}

export function isHarmonyHostAdapterAvailable(name: string): boolean {
  return registered.has(name);
}
