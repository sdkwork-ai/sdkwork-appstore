const { auth, loadCurrentUser } = require("../../runtime/appstore-app");
const { setIamSession } = require("../../bootstrap/iamRuntime");

Page({
  data: { account: "", password: "", submitting: false, error: "" },
  onAccountInput(e) { this.setData({ account: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },
  async onSubmit() {
    const account = this.data.account.trim();
    const password = this.data.password;
    if (!account || !password) {
      this.setData({ error: "请填写账号与密码" });
      return;
    }
    this.setData({ submitting: true, error: "" });
    try {
      await auth.loginWithPassword(account, password);
      try {
        const profile = await loadCurrentUser();
        setIamSession({ ...require("../../bootstrap/iamRuntime").getIamSession(), displayName: profile.displayName, userId: profile.userId });
      } catch (e) { /* profile is best-effort */ }
      wx.navigateBack({ fail: () => wx.switchTab({ url: "/pages/home/index" }) });
    } catch (error) {
      this.setData({ error: error?.message || "登录失败，请稍后重试" });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
