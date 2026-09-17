import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { WishlistViewModel } from '../presentation/viewModels/WishlistViewModel';

/**
 * Wishlist page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct WishlistPage {
  private viewModel: WishlistViewModel = new WishlistViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Wishlist' })
    }
    .width('100%')
    .height('100%')
  }
}

export { WishlistPage };
