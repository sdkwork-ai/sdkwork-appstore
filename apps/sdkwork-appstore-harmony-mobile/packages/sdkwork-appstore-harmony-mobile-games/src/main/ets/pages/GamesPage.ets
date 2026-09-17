import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { GamesViewModel } from '../presentation/viewModels/GamesViewModel';

/**
 * Games page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct GamesPage {
  private viewModel: GamesViewModel = new GamesViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Games' })
    }
    .width('100%')
    .height('100%')
  }
}

export { GamesPage };
