import { AppstoreDesignTokens } from '../theme/DesignTokens';
import { AppstoreCreateMenu } from './CreateMenu';

/** Store home navbar: editorial caption + title on the left, the creation-hub
 *  plus menu on the right (UI_DESIGN_SPEC §3.2 H5 nav pattern, shared with the
 *  H5/mini-program home headers). */
@Component
export struct AppstoreNavBar {
  @Prop title: string = '发现';
  @Prop caption: string = '';
  onCreateSelect: (type: string) => void = () => {};

  build() {
    Row() {
      Column() {
        Text(this.caption)
          .fontSize(11)
          .fontWeight(FontWeight.Medium)
          .fontColor(AppstoreDesignTokens.textTertiary)
          .letterSpacing(2)
        Text(this.title)
          .fontSize(30)
          .fontWeight(FontWeight.Bold)
          .fontColor(AppstoreDesignTokens.textPrimary)
          .margin({ top: 2 })
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)

      AppstoreCreateMenu({ onSelect: (type: string) => this.onCreateSelect(type) })
    }
    .width('100%')
    .padding({
      left: AppstoreDesignTokens.spaceLg,
      right: AppstoreDesignTokens.spaceLg,
      top: AppstoreDesignTokens.spaceMd,
      bottom: AppstoreDesignTokens.spaceSm,
    })
  }
}
