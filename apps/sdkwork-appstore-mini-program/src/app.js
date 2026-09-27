const { bootstrapAppstoreMiniProgram } = require("./runtime/appstore-app");
const runtimeEnv = require("./runtime/runtime-env");

App({
  globalData: {
    sdkworkProfileId: runtimeEnv.SDKWORK_PROFILE_ID,
    appstoreAppApiBaseUrl: runtimeEnv.SDKWORK_APPSTORE_APP_API_BASE_URL,
  },
  onLaunch() {
    try {
      bootstrapAppstoreMiniProgram({
        appApiBaseUrl: this.globalData.appstoreAppApiBaseUrl,
        accessToken: this.globalData.sdkworkAccessToken,
      });
    } catch {
      // Runtime bundle is produced by `pnpm run build`.
    }
    wx.reLaunch({ url: "/pages/home/index" });
  },
});
