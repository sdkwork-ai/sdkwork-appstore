const { pageLoaders } = require("../../runtime/appstore-app");

Page({
  data: { loading: true, error: "", items: [], tab: "free" },
  onLoad() {
    this.load("free");
  },
  onTabChange(event) {
    const tab = event.currentTarget.dataset.tab;
    if (tab === this.data.tab) {
      return;
    }
    this.setData({ tab });
    this.load(tab);
  },
  load(kind) {
    this.setData({ loading: true, error: "" });
    pageLoaders
      .charts(kind)
      .then((items) => this.setData({ items, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "榜单加载失败" }),
      );
  },
  onItemTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
});
