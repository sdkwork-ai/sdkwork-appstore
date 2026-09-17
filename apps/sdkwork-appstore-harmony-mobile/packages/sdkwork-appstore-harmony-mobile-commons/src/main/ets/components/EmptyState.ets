import { AppstoreDesignTokens } from '../theme/DesignTokens';

@Component
export struct AppstoreEmptyState {
  @Prop message: string = '';

  build() {
    Column() {
      Text(this.message)
        .fontSize(14)
        .fontColor(AppstoreDesignTokens.textSecondary)
    }
    .width('100%')
    .padding(AppstoreDesignTokens.spaceLg)
  }
}
