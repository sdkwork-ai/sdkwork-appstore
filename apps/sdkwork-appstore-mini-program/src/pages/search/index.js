const { pageLoaders } = require("../../runtime/appstore-app");

Page({
  data: { loading: false, error: "", items: [], keyword: "", searched: false },
  onKeywordInput(event) {
    this.setData({ keyword: event.detail.value });
  },
  onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) {
      return;
    }
    this.setData({ loading: true, error: "", searched: true });
    pageLoaders
      .search(keyword)
      .then((items) => this.setData({ items, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "搜索失败" }),
      );
  },
  onItemTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
});
