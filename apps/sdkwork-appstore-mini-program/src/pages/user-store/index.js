const { pageLoaders, auth } = require("../../runtime/appstore-app");
const { isIamAuthenticated } = require("../../bootstrap/iamRuntime");

Page({
  data: {
    authed: false,
    loading: false,
    error: "",
    categories: [],
    shares: [],
  },
  onLoad() {
    this.setData({ authed: isIamAuthenticated() });
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
      .userStore()
      .then((result) => this.setData({ categories: result.categories, shares: result.shares, loading: false }))
      .catch((error) =>
        this.setData({ loading: false, error: error?.message || "加载失败" }),
      );
  },
  onCategoryCreate() {
    wx.showModal({
      title: "新建分类",
      editable: true,
      placeholderText: "分类名称",
      success: (res) => {
        if (res.confirm && res.content?.trim()) {
          pageLoaders
            .createCategory(res.content.trim())
            .then(() => this.load())
            .catch((error) =>
              wx.showToast({ title: error?.message || "创建失败", icon: "none" }),
            );
        }
      },
    });
  },
  onCategoryDelete(event) {
    const { id, name } = event.currentTarget.dataset;
    wx.showModal({
      title: "删除分类",
      content: `确定删除「${name}」吗？`,
      success: (res) => {
        if (res.confirm) {
          pageLoaders
            .deleteCategory(id)
            .then(() => this.load())
            .catch((error) =>
              wx.showToast({ title: error?.message || "删除失败", icon: "none" }),
            );
        }
      },
    });
  },
  onShareCreate() {
    pageLoaders
      .createShare("我的 Appstore")
      .then(() => this.load())
      .catch((error) =>
        wx.showToast({ title: error?.message || "创建分享失败", icon: "none" }),
      );
  },
  onShareRevoke(event) {
    const { id } = event.currentTarget.dataset;
    pageLoaders
      .revokeShare(id)
      .then(() => this.load())
      .catch((error) =>
        wx.showToast({ title: error?.message || "撤销失败", icon: "none" }),
      );
  },
  onShareCopy(event) {
    const { token } = event.currentTarget.dataset;
    wx.setClipboardData({ data: `/store/${token}` });
  },
  onCategoryTap(event) {
    const { id } = event.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/category/index?id=${id}` });
  },
});
