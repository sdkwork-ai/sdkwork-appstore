const { auth } = require("../../runtime/appstore-app");
const { isIamAuthenticated, getIamSession } = require("../../bootstrap/iamRuntime");

Page({
  data: { authed: false, displayName: "" },
  onLoad() {
    this.setData({ authed: isIamAuthenticated(), displayName: getIamSession().displayName ?? "" });
    if (this.data.authed) {
      this.loadProfile();
    }
  },
  onShow() {
    const value = isIamAuthenticated();
    if (value !== this.data.authed) {
      this.setData({ authed: value, displayName: value ? getIamSession().displayName ?? "" : "" });
      if (value) this.loadProfile();
    }
  },
  loadProfile() {
    auth
      .currentUser()
      .then((profile) => {
        this.setData({ displayName: profile.displayName });
        const session = getIamSession();
        session.displayName = profile.displayName;
      })
      .catch(() => undefined);
  },
  onLogout() {
    auth.logout();
    this.setData({ authed: false, displayName: "" });
  },
});
