import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { AiHubViewModel } from '../presentation/viewModels/AiHubViewModel';

/**
 * Ai Hub page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct AiHubPage {
  private viewModel: AiHubViewModel = new AiHubViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Ai Hub' })
    }
    .width('100%')
    .height('100%')
  }
}

export { AiHubPage };
