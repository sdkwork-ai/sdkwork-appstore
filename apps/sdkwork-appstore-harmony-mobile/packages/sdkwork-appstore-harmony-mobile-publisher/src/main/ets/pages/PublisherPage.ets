import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { PublisherViewModel } from '../presentation/viewModels/PublisherViewModel';

/**
 * Publisher page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct PublisherPage {
  private viewModel: PublisherViewModel = new PublisherViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Publisher' })
    }
    .width('100%')
    .height('100%')
  }
}

export { PublisherPage };
