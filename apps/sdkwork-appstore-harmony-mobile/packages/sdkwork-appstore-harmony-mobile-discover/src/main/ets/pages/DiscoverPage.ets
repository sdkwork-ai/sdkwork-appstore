import router from '@ohos.router';
import promptAction from '@ohos.promptAction';

import {
  AppstoreDesignTokens,
  AppstoreEmptyState,
  AppstoreNavBar,
} from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

import { DiscoverViewModel } from '../presentation/viewModels/DiscoverViewModel';

/** Creation-hub presets (`?create=`) resolved to canonical app.appType values
 *  (APP_ASSETS_SPEC.md section 5.3); a preset is never the stored type. */
const APP_TYPE_BY_PARAM: Record<string, string> = {
  app: 'APP_REACT',
  website: 'APP_HTML',
  game: 'APP_HTML',
  festival: 'POSTER',
  promo: 'VIDEO',
};

const WEEKDAY_LABELS: string[] = ['日', '一', '二', '三', '四', '五', '六'];

/** Route parameters carried to the publisher page (arkts-no-untyped-obj-literals). */
interface CreateRouteParams {
  create: string;
  appType: string;
}

/**
 * Discover page.
 *
 * Pages stay in capability packages; the entry module keeps only bootstrap,
 * provider assembly, and route registration
 * (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
 */
@Entry
@Component
struct DiscoverPage {
  private viewModel: DiscoverViewModel = new DiscoverViewModel();
  @State caption: string = '';

  aboutToAppear(): void {
    const now = new Date();
    this.caption =
      `${now.getMonth() + 1}月${now.getDate()}日 星期${WEEKDAY_LABELS[now.getDay()]}`;
  }

  /** Creation-hub selection: route to the publisher page carrying the preset;
   *  while the harmony navigation scaffold is not wired to registered pages,
   *  surface the honest degradation instead of a silent failure. */
  handleCreateSelect(type: string): void {
    const params: CreateRouteParams = {
      create: type,
      appType: APP_TYPE_BY_PARAM[type] ?? 'APP_REACT',
    };
    router.pushUrl({
      url: 'pages/PublisherPage',
      params: params,
    }).catch(() => {
      promptAction.showToast({ message: '发布者中心即将开放', duration: 1500 });
    });
  }

  build() {
    Column() {
      AppstoreNavBar({
        title: '发现',
        caption: this.caption,
        onCreateSelect: (type: string): void => this.handleCreateSelect(type),
      })
      AppstoreEmptyState({ message: 'Discover' })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(AppstoreDesignTokens.background)
  }
}

export { DiscoverPage };
