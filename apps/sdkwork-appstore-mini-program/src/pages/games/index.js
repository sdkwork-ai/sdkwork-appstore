const { pageLoaders } = require("../../runtime/appstore-app");

Page({
  data: { loading: true, loadingMore: false, error: "", items: [], nextCursor: "" },
  onLoad() {
    this.loadFirst();
  },
  onPullDownRefresh() {
    this.loadFirst();
    wx.stopPullDownRefresh();
  },
  onReachBottom() {
    this.loadMore();
  },
  loadFirst() {
    this.setData({ loading: true, error: "" });
    pageLoaders
      .games()
      .then((page) =>
        this.setData({ items: page.rows, nextCursor: page.nextCursor ?? "", loading: false }),
      )
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "加载失败" }),
      );
  },
  loadMore() {
    const cursor = this.data.nextCursor;
    if (!cursor || this.data.loadingMore) {
      return;
    }
    this.setData({ loadingMore: true });
    pageLoaders
      .games(cursor)
      .then((page) =>
        this.setData({
          items: this.data.items.concat(page.rows),
          nextCursor: page.nextCursor ?? "",
          loadingMore: false,
        }),
      )
      .catch(() => this.setData({ loadingMore: false }));
  },
  onItemTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
});
