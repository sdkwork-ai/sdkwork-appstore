import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { AppsViewModel } from '../presentation/viewModels/AppsViewModel';

/**
 * Apps page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct AppsPage {
  private viewModel: AppsViewModel = new AppsViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Apps' })
    }
    .width('100%')
    .height('100%')
  }
}

export { AppsPage };
