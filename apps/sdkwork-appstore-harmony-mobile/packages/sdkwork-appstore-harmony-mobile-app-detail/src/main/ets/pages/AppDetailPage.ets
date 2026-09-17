import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { AppDetailViewModel } from '../presentation/viewModels/AppDetailViewModel';

/**
 * App Detail page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct AppDetailPage {
  private viewModel: AppDetailViewModel = new AppDetailViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'App Detail' })
    }
    .width('100%')
    .height('100%')
  }
}

export { AppDetailPage };
