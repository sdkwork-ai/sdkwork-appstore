import { AppstoreDesignTokens } from '@sdkwork/sdkwork-appstore-harmony-mobile-commons';

/** Route stack assembled from capability route contributions. */
@Component
export struct AppstoreRouteStack {
  build() {
    Column() {
      Text('SDKWork App Store')
        .fontSize(20)
        .fontColor(AppstoreDesignTokens.textPrimary)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}
