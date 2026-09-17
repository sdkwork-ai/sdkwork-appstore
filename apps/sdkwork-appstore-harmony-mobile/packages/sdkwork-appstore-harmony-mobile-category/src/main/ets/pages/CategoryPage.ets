import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { CategoryViewModel } from '../presentation/viewModels/CategoryViewModel';

/**
 * Category page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct CategoryPage {
  private viewModel: CategoryViewModel = new CategoryViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Category' })
    }
    .width('100%')
    .height('100%')
  }
}

export { CategoryPage };
