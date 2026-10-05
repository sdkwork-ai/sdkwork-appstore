import { AppstoreDesignTokens } from '../theme/DesignTokens';

/** One creation-hub preset surfaced by the navbar plus menu. Each preset maps
 *  to a store application type (appstore_app.app_type) carried into the
 *  publisher bootstrap as the `create` route parameter. */
interface AppstoreCreateTarget {
  type: string;
  title: string;
  description: string;
}

const CREATE_TARGETS: AppstoreCreateTarget[] = [
  { type: 'app', title: '新建应用', description: '发布一个全新的应用' },
  { type: 'website', title: '新建官网', description: '搭建并发布官方网站' },
  { type: 'promo', title: '新建宣传应用', description: '创建宣传页应用' },
];

/** Creation hub: the accent plus button opens a dropdown with the store's
 *  creation entries (new app / new website / new promo app). Menu selection is
 *  reported through `onSelect` with the preset type. */
@Component
export struct AppstoreCreateMenu {
  onSelect: (type: string) => void = () => {};

  @Builder
  menuItem(target: AppstoreCreateTarget) {
    Row() {
      Text(target.title)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(AppstoreDesignTokens.textPrimary)
      Text(target.description)
        .fontSize(12)
        .fontColor(AppstoreDesignTokens.textTertiary)
        .margin({ left: AppstoreDesignTokens.spaceSm })
        .layoutWeight(1)
        .maxLines(1)
        .textOverflow({ overflow: TextOverflow.Ellipsis })
    }
    .width('100%')
    .padding({ left: AppstoreDesignTokens.spaceMd, right: AppstoreDesignTokens.spaceMd })
    .onClick(() => this.onSelect(target.type))
  }

  @Builder
  menuContent() {
    Column() {
      ForEach(CREATE_TARGETS, (target: AppstoreCreateTarget) => {
        this.menuItem(target)
      }, (target: AppstoreCreateTarget) => target.type)
    }
    .width(240)
    .padding({ top: AppstoreDesignTokens.spaceSm, bottom: AppstoreDesignTokens.spaceSm })
    .backgroundColor(AppstoreDesignTokens.surface)
    .borderRadius(16)
  }

  build() {
    Button('+')
      .width(40)
      .height(40)
      .fontSize(22)
      .fontColor(Color.White)
      .type(ButtonType.Circle)
      .backgroundColor(AppstoreDesignTokens.accent)
      .shadow({ radius: 10, color: 'rgba(0, 113, 227, 0.32)', offsetY: 4 })
      .bindMenu(this.menuContent)
  }
}
