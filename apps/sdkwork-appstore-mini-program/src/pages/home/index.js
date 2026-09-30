const { bootstrapAppstoreMiniProgram } = require("../../runtime/appstore-app");

/** Capability entries mirror the cross-client route table capabilities. */
const CAPABILITIES = [
  { key: "discover", name: "发现", desc: "编辑精选与合集" },
  { key: "apps", name: "应用", desc: "全量应用浏览" },
  { key: "games", name: "游戏", desc: "桌游 / 小游戏 / 掌机" },
  { key: "charts", name: "排行榜", desc: "免费榜与付费榜" },
  { key: "category", name: "分类", desc: "按分类浏览应用" },
  { key: "collection", name: "合集", desc: "编辑精选合集" },
  { key: "ai-hub", name: "AI 中心", desc: "专家 / 插件 / 模板" },
  { key: "search", name: "搜索", desc: "应用与游戏搜索" },
  { key: "app-detail", name: "应用详情", desc: "介绍 / 评价 / 获取" },
  { key: "events", name: "限时活动", desc: "活动应用精选" },
  { key: "library", name: "我的库", desc: "已获取与更新" },
  { key: "wishlist", name: "心愿单", desc: "收藏的应用" },
  { key: "user-store", name: "个人商店", desc: "自定义分类与分享" },
  { key: "publisher", name: "开发者中心", desc: "上架与版本管理" },
  { key: "settings", name: "设置", desc: "账户与通用偏好" },
  { key: "updates", name: "更新", desc: "可用更新管理" },
];

Page({
  data: {
    status: "loading",
    statusLabel: "运行时加载中…",
    capabilities: CAPABILITIES,
  },
  onLoad() {
    try {
      bootstrapAppstoreMiniProgram({});
      this.setData({ status: "ready", statusLabel: "运行时就绪" });
    } catch (error) {
      this.setData({
        status: "error",
        statusLabel: "运行时未构建，请先执行 pnpm run build",
      });
    }
  },
  onCapabilityTap(event) {
    const { name } = event.currentTarget.dataset;
    wx.showToast({ title: `${name} · 小程序端即将开放`, icon: "none" });
  },
});
