import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { SettingsViewModel } from '../presentation/viewModels/SettingsViewModel';

/**
 * Settings page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct SettingsPage {
  private viewModel: SettingsViewModel = new SettingsViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Settings' })
    }
    .width('100%')
    .height('100%')
  }
}

export { SettingsPage };
