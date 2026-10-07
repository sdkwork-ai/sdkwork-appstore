import { configureConsoleSettingsClient } from '@sdkwork/appstore-h5-console-settings';
import { getStoreClient } from '@/services/storeClient';

/** Wire the console settings package with the app-root SDK client. */
export function bootstrapConsoleSettings(): void {
  configureConsoleSettingsClient(() => getStoreClient());
}
