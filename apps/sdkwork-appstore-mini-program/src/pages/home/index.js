const { bootstrapAppstoreMiniProgram, pageLoaders } = require("../../runtime/appstore-app");

/** Capability entries mirror the cross-client route table capabilities. */
const CAPABILITIES = [
  { key: "apps", name: "应用", desc: "全量应用浏览", path: "/pages/apps/index" },
  { key: "games", name: "游戏", desc: "桌游 / 小游戏 / 掌机", path: "/pages/games/index" },
  { key: "charts", name: "排行榜", desc: "免费榜与付费榜", path: "/pages/charts/index" },
  { key: "search", name: "搜索", desc: "应用与游戏搜索", path: "/pages/search/index" },
  { key: "templates", name: "应用模板", desc: "从模板快速启动", path: "/pages/templates/index" },
  { key: "settings", name: "设置", desc: "账户与通用偏好", path: "/pages/settings/index" },
];

Page({
  data: {
    runtimeReady: false,
    loading: true,
    error: "",
    heroApps: [],
    categories: [],
    events: [],
    recommendations: [],
    capabilities: CAPABILITIES,
  },
  onLoad() {
    try {
      bootstrapAppstoreMiniProgram({});
      this.setData({ runtimeReady: true });
    } catch (error) {
      this.setData({
        runtimeReady: false,
        loading: false,
        error: "运行时未构建，请先执行 pnpm run build",
      });
      return;
    }
    this.loadFeed();
  },
  loadFeed() {
    this.setData({ loading: true, error: "" });
    pageLoaders
      .discover()
      .then((feed) =>
        this.setData({
          heroApps: feed.heroApps,
          categories: feed.categories,
          events: feed.events,
          recommendations: feed.recommendations,
          loading: false,
        }),
      )
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "首页加载失败" }),
      );
  },
  onPullDownRefresh() {
    this.loadFeed();
    wx.stopPullDownRefresh();
  },
  onRetry() {
    this.loadFeed();
  },
  onHeroTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
  onExploreTap() {
    wx.navigateTo({ url: "/pages/apps/index" });
  },
  onCategoryTap(event) {
    const { id, name } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/category/index?id=${id}&name=${name}` });
  },
  onEventTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/events/index?id=${id}` });
  },
  onRecommendationTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
  onCapabilityTap(event) {
    const { name, path } = event.currentTarget.dataset;
    if (path) {
      wx.navigateTo({ url: path });
      return;
    }
    wx.showToast({ title: `${name} · 小程序端即将开放`, icon: "none" });
  },
});
