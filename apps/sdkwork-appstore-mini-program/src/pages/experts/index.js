const { pageLoaders } = require("../../runtime/appstore-app");

Page({
  data: { loading: true, error: "", items: [] },
  onLoad() {
    pageLoaders
      .templates("EXPERTS")
      .then((items) => this.setData({ items, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "专家加载失败" }),
      );
  },
});
