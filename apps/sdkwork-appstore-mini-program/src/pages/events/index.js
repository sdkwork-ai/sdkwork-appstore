const { pageLoaders } = require("../../runtime/appstore-app");

Page({
  data: { loading: true, error: "", items: [], name: "限时活动" },
  onLoad(options) {
    const eventId = options?.id ?? "";
    pageLoaders
      .events(eventId)
      .then((result) => this.setData({ name: result.name, items: result.apps, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "加载失败" }),
      );
  },
  onItemTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
});
