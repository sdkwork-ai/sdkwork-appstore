import { registerHarmonyHostAdapters } from '@sdkwork/sdkwork-appstore-harmony-mobile-host';

/** Register platform host adapters before the first page renders. */
export function registerHostAdapters(): void {
  registerHarmonyHostAdapters();
}
