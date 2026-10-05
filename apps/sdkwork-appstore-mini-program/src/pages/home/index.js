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

/** Creation hub entries surfaced by the header plus button; each preset maps
 *  to a store application type handled by the publisher create flow. */
const CREATE_TARGETS = [
  { type: "app", name: "新建应用", desc: "发布一个全新的应用" },
  { type: "website", name: "新建官网", desc: "搭建并发布官方网站" },
  { type: "promo", name: "新建宣传应用", desc: "创建宣传页应用" },
];

/** Deterministic gradient index per name, mirroring the cross-client palette
 *  (UI_DESIGN_SPEC §2: brand-first vibrant system colors). */
function gradientIndex(name) {
  let hash = 0;
  const text = String(name || "");
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % 6;
}

function withGradient(rows) {
  return (rows || []).map((row) => ({ ...row, g: gradientIndex(row.name || row.title) }));
}

function formatEventEnds(endsAt) {
  const parsed = Date.parse(endsAt);
  if (!Number.isFinite(parsed)) {
    return "";
  }
  const date = new Date(parsed);
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

Page({
  data: {
    loading: true,
    error: "",
    todayLine: "",
    heroApps: [],
    heroCurrent: 0,
    categories: [],
    collections: [],
    events: [],
    chartApps: [],
    recommendations: [],
    capabilities: CAPABILITIES,
    createTargets: CREATE_TARGETS,
    createMenuOpen: false,
  },
  onLoad() {
    try {
      bootstrapAppstoreMiniProgram({});
    } catch (error) {
      this.setData({
        loading: false,
        error: "运行时未构建，请先执行 pnpm run build",
      });
      return;
    }
    this.setData({
      todayLine: new Date().toLocaleDateString("zh-CN", {
        month: "long",
        day: "numeric",
        weekday: "long",
      }),
    });
    this.loadFeed();
  },
  loadFeed() {
    this.setData({ loading: true, error: "" });
    // 榜单独家加载：失败不阻塞首页其它分区（流式分区，UI_DESIGN_SPEC §5.1）。
    pageLoaders
      .charts("free")
      .then((rows) => this.setData({ chartApps: rows.slice(0, 5) }))
      .catch(() => this.setData({ chartApps: [] }));
    pageLoaders
      .discover()
      .then((feed) => {
        const events = (feed.events || []).map((row) => ({
          ...row,
          endsLabel: row.endsAt ? formatEventEnds(row.endsAt) : "",
        }));
        this.setData({
          heroApps: withGradient(feed.heroApps),
          categories: withGradient(feed.categories),
          collections: withGradient(feed.collections),
          events: withGradient(events),
          recommendations: withGradient(feed.recommendations),
          loading: false,
        });
      })
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
  onHeroSwipe(event) {
    this.setData({ heroCurrent: event.detail.current });
  },
  onHeroTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
  onSearchTap() {
    wx.navigateTo({ url: "/pages/search/index" });
  },
  onCreateMenuToggle() {
    this.setData({ createMenuOpen: !this.data.createMenuOpen });
  },
  onCreateMenuClose() {
    this.setData({ createMenuOpen: false });
  },
  onCreateTargetTap(event) {
    const { type } = event.currentTarget.dataset;
    this.setData({ createMenuOpen: false });
    wx.navigateTo({ url: `/pages/publisher/index?create=${type}` });
  },
  onCategoryTap(event) {
    const { id, name } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/category/index?id=${id}&name=${name}` });
  },
  onCollectionTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/collection/index?id=${id}` });
  },
  onEventTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/events/index?id=${id}` });
  },
  onChartAppTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
  onChartsTap() {
    wx.navigateTo({ url: "/pages/charts/index" });
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
