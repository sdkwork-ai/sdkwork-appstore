const { bootstrapAppstoreMiniProgram } = require("../../runtime/appstore-app");

Page({
  data: { status: "loading" },
  onLoad() {
    try {
      bootstrapAppstoreMiniProgram({});
      this.setData({ status: "ready" });
    } catch (error) {
      this.setData({ status: "runtime bundle missing; run pnpm run build" });
    }
  },
});
