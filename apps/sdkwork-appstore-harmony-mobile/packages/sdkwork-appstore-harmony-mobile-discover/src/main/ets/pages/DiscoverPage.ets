import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { DiscoverViewModel } from '../presentation/viewModels/DiscoverViewModel';

/**
 * Discover page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct DiscoverPage {
  private viewModel: DiscoverViewModel = new DiscoverViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Discover' })
    }
    .width('100%')
    .height('100%')
  }
}

export { DiscoverPage };
