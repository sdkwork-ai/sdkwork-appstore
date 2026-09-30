const { pageLoaders } = require("../../runtime/appstore-app");

Page({
  data: { loading: true, error: "", detail: null },
  onLoad(options) {
    const listingId = options?.id ?? "";
    pageLoaders
      .appDetail(listingId)
      .then((detail) => this.setData({ detail, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "详情加载失败" }),
      );
  },
  onItemTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
});
