import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { UserStoreViewModel } from '../presentation/viewModels/UserStoreViewModel';

/**
 * User Store page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct UserStorePage {
  private viewModel: UserStoreViewModel = new UserStoreViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'User Store' })
    }
    .width('100%')
    .height('100%')
  }
}

export { UserStorePage };
