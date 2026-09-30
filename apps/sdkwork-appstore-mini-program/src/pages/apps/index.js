const { pageLoaders } = require("../../runtime/appstore-app");

Page({
  data: { loading: true, error: "", items: [] },
  onLoad() {
    pageLoaders
      .apps()
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
