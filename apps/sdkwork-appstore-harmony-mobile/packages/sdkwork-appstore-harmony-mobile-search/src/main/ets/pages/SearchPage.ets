import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { SearchViewModel } from '../presentation/viewModels/SearchViewModel';

/**
 * Search page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct SearchPage {
  private viewModel: SearchViewModel = new SearchViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Search' })
    }
    .width('100%')
    .height('100%')
  }
}

export { SearchPage };
