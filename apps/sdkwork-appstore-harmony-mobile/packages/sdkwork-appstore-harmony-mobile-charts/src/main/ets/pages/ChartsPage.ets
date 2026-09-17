import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { ChartsViewModel } from '../presentation/viewModels/ChartsViewModel';

/**
 * Charts page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct ChartsPage {
  private viewModel: ChartsViewModel = new ChartsViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Charts' })
    }
    .width('100%')
    .height('100%')
  }
}

export { ChartsPage };
