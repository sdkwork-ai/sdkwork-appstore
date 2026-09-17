import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { CollectionViewModel } from '../presentation/viewModels/CollectionViewModel';

/**
 * Collection page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct CollectionPage {
  private viewModel: CollectionViewModel = new CollectionViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Collection' })
    }
    .width('100%')
    .height('100%')
  }
}

export { CollectionPage };
