import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { UpdatesViewModel } from '../presentation/viewModels/UpdatesViewModel';

/**
 * Updates page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct UpdatesPage {
  private viewModel: UpdatesViewModel = new UpdatesViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Updates' })
    }
    .width('100%')
    .height('100%')
  }
}

export { UpdatesPage };
