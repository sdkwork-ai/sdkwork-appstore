const { pageLoaders, auth } = require("../../runtime/appstore-app");
const { isIamAuthenticated } = require("../../bootstrap/iamRuntime");

/** Store application type presets reachable from the home creation hub. */
const CREATE_TYPES = {
  app: "应用",
  website: "官网",
  game: "游戏",
  festival: "节日祝福",
  promo: "宣传应用",
};

// Create-menu presets resolved to canonical app.appType values
// (APP_ASSETS_SPEC.md section 5.3); a preset is never stored as the app type.
const APP_TYPE_BY_PARAM = {
  app: "APP_REACT",
  website: "APP_HTML",
  game: "APP_HTML",
  festival: "POSTER",
  promo: "VIDEO",
};

Page({
  data: { authed: false, createPanel: false, createType: "", createTypeName: "", createName: "", createKey: "", creating: false, createError: "" },
  onLoad(options) {
    const create = options && typeof options.create === "string" ? options.create : "";
    const createTypeName = CREATE_TYPES[create] || "";
    this.setData({
      authed: isIamAuthenticated(),
      createPanel: Boolean(createTypeName),
      createType: createTypeName ? create : "",
      createTypeName,
    });
    if (this.data.authed) {
      this.load();
    }
  },
  onShow() {
    const value = isIamAuthenticated();
    if (value !== this.data.authed) {
      this.setData({ authed: value });
      if (value) this.load();
    }
  },
  onLoginTap() {
    wx.navigateTo({ url: "/pages/login/index" });
  },
  load() {
    this.setData({ loading: true, error: "" });
    pageLoaders
      .publisher()
      .then((items) => this.setData({ items, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "加载失败" }),
      );
  },
  onItemTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/app-detail/index?id=${id}` });
  },
  onCreateFabTap() {
    this.setData({ createPanel: true, createType: "app", createTypeName: "应用" });
  },
  onCreateCancel() {
    this.setData({ createPanel: false, createType: "", createName: "", createKey: "", createError: "" });
  },
  onCreateNameInput(event) {
    this.setData({ createName: event.detail.value });
  },
  onCreateKeyInput(event) {
    this.setData({ createKey: event.detail.value });
  },
  onCreateSubmit() {
    const name = this.data.createName.trim();
    const appKey = this.data.createKey.trim();
    if (!name || !appKey) {
      this.setData({ createError: "请填写应用名称与 App Key" });
      return;
    }
    this.setData({ creating: true, createError: "" });
    pageLoaders
      .createPublisherApp({
        displayName: name,
        appKey,
        appType: APP_TYPE_BY_PARAM[this.data.createType] || "APP_REACT",
      })
      .then(() => {
        wx.showToast({ title: "草稿已保存", icon: "success" });
        this.setData({
          creating: false,
          createPanel: false,
          createName: "",
          createKey: "",
        });
        this.load();
      })
      .catch((error) =>
        this.setData({
          creating: false,
          createError: error?.message || "创建失败，请稍后重试",
        }),
      );
  },
});
