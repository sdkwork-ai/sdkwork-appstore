const { pageLoaders, auth } = require("../../runtime/appstore-app");
const { isIamAuthenticated } = require("../../bootstrap/iamRuntime");

/** Storefront platform-code groups (UI_DESIGN_SPEC §2; appstore_platform_dictionary). */
const DESKTOP_PLATFORMS = ["windows", "macos", "linux"];
const WEB_PLATFORMS = ["web", "h5"];

/** First platform code in the group present on the listing. */
function platformIn(platforms, group) {
  return group.find((code) => platforms.includes(code)) ?? "";
}

Page({
  data: {
    loading: true,
    error: "",
    detail: null,
    authed: false,
    acquiring: false,
    acquired: false,
  },
  onLoad(options) {
    const listingId = options?.id ?? "";
    this.setData({ authed: isIamAuthenticated() });
    this.load(listingId);
  },
  load(listingId) {
    if (!listingId) {
      this.setData({ loading: false, error: "缺少应用标识" });
      return;
    }
    pageLoaders
      .appDetail(listingId)
      .then((detail) => this.setData({ detail, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "详情加载失败" }),
      );
  },
  onRetry() {
    this.setData({ loading: true, error: "" });
    this.load(this.data.detail?.id || "");
  },
  onItemTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },

  /** Primary acquisition action, resolved per distribution mode. */
  onPrimaryAction() {
    const detail = this.data.detail;
    if (!detail) {
      return;
    }
    const platforms = detail.platforms || [];
    if (this.data.acquired) {
      this.applyPrimaryAction(detail);
      return;
    }
    if (String(detail.pricingModel).toUpperCase() === "PAID") {
      wx.showToast({ title: "付费应用需先购买，支付流程即将开放", icon: "none" });
      return;
    }
    if (!this.data.authed) {
      wx.navigateTo({ url: "/pages/login/index" });
      return;
    }
    this.applyPrimaryAction(detail);
  },
  applyPrimaryAction(detail) {
    if (this.data.acquiring) {
      return;
    }
    const platforms = detail.platforms || [];
    // Web/H5 应用免安装直达：复制访问地址（小程序无法直接打开外链）。
    if (WEB_PLATFORMS.some((code) => platforms.includes(code)) && detail.accessUrl) {
      wx.setClipboardData({
        data: detail.accessUrl,
        success: () => {
          this.setData({ acquired: true });
          wx.showToast({ title: "访问链接已复制", icon: "success" });
        },
      });
      return;
    }
    const platform =
      platformIn(platforms, DESKTOP_PLATFORMS) ||
      platformIn(platforms, ["android", "ios", "harmonyos"]) ||
      platforms[0] ||
      "h5";
    this.setData({ acquiring: true });
    pageLoaders
      .installListing(detail.id, platform)
      .then(() => {
        this.setData({ acquiring: false, acquired: true });
        wx.showToast({ title: "已添加到我的库", icon: "success" });
      })
      .catch((error) => {
        this.setData({ acquiring: false });
        const message = String(error?.message || "");
        wx.showToast({
          title: message.includes("entitlement")
            ? "付费应用需先购买，支付流程即将开放"
            : message || "获取失败，请稍后重试",
          icon: "none",
        });
      });
  },
  onLoginTap() {
    wx.navigateTo({ url: "/pages/login/index" });
  },
});
