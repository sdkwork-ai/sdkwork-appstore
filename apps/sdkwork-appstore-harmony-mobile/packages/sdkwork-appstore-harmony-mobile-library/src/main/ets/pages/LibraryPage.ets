import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { LibraryViewModel } from '../presentation/viewModels/LibraryViewModel';

/**
 * Library page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct LibraryPage {
  private viewModel: LibraryViewModel = new LibraryViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Library' })
    }
    .width('100%')
    .height('100%')
  }
}

export { LibraryPage };
