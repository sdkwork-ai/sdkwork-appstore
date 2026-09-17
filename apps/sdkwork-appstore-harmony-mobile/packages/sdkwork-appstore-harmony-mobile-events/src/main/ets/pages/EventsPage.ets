import { AppstoreEmptyState } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { EventsViewModel } from '../presentation/viewModels/EventsViewModel';

/**
 * Events page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct EventsPage {
  private viewModel: EventsViewModel = new EventsViewModel();

  build() {
    Column() {
      AppstoreEmptyState({ message: 'Events' })
    }
    .width('100%')
    .height('100%')
  }
}

export { EventsPage };
