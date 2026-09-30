const { pageLoaders, auth } = require("../../runtime/appstore-app");
const { isIamAuthenticated } = require("../../bootstrap/iamRuntime");

Page({
  data: { authed: false },
  onLoad() {
    this.setData({ authed: isIamAuthenticated() });
    if (this.data.authed) {
      this.load();
    }
  },
  onShow() {
    const value = isIamAuthenticated();
    if (value !== this.data.authed) {
      this.setData({ authed: value });
      if (value) this.load();
    }
  },
  onLoginTap() {
    wx.navigateTo({ url: "/pages/login/index" });
  },
  load() {
    this.setData({ loading: true, error: "" });
    pageLoaders
      .publisher()
      .then((items) => this.setData({ items, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "加载失败" }),
      );
  },
  onItemTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
});
