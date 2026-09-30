const { pageLoaders, auth } = require("../../runtime/appstore-app");
const { isIamAuthenticated, onIamSessionChange } = require("../../bootstrap/iamRuntime");

Page({
  data: { authed: false, loading: false, error: "", items: [] },
  onLoad() {
    this.setData({ authed: isIamAuthenticated() });
    if (this.data.authed) {
      this.load();
    }
  },
  onShow() {
    const authed = isIamAuthenticated();
    if (authed !== this.data.authed) {
      this.setData({ authed });
      if (authed) this.load();
    }
  },
  load() {
    this.setData({ loading: true, error: "" });
    pageLoaders
      .library()
      .then((items) => this.setData({ items, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "加载失败" }),
      );
  },
  onLoginTap() {
    wx.navigateTo({ url: "/pages/login/index" });
  },
  onItemTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
});
