const { pageLoaders } = require("../../runtime/appstore-app");

Page({
  data: { loading: true, error: "", items: [], name: "精选合集" },
  onLoad(options) {
    const collectionId = options?.id ?? "";
    pageLoaders
      .collection(collectionId)
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
