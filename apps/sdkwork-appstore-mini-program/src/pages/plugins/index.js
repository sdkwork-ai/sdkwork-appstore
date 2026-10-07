const { pageLoaders } = require("../../runtime/appstore-app");

Page({
  data: { loading: true, error: "", items: [] },
  onLoad() {
    pageLoaders
      .templates("PLUGINS")
      .then((items) => this.setData({ items, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "扩展插件加载失败" }),
      );
  },
});
