/**
 * Locale fragment: 数据看板域（`adminDashboard`）。
 *
 * Owned by `@sdkwork/appstore-pc-admin-dashboard`
 * (`I18N_SPEC.md` §6.1: `src/i18n/<locale>/appstore/admin/<fragment>.ts`).
 */
export const adminDashboard = {
  title: '数据看板',
  range: {
    from: '开始日期',
    to: '结束日期',
  },
  overview: {
    title: '运营总览',
    description: '查看应用总数、下载、评价与治理待办等商店整体指标。',
    noSnapshot: '后端未返回该时间范围的看板快照，请调整时间范围后重试。',
    kpi: {
      totalListings: '应用总数',
      totalDownloads: '累计下载',
      totalReviews: '累计评价',
      pendingModeration: '待审核提交',
      activePublishers: '活跃开发者',
      dailyInstalls: '今日安装',
    },
  },
  search: {
    title: '搜索分析',
    description: '查看商店搜索词的搜索量、结果覆盖率与点击转化。',
    filterQuery: '搜索词',
    filterQueryPlaceholder: '按搜索词过滤',
    columns: {
      term: '搜索词',
      searchCount: '搜索次数',
      resultCount: '结果数',
      zeroResultRatio: '零结果占比',
      clickThroughRatio: '点击率',
      topListing: '首位应用',
    },
    empty: '当前筛选条件下没有搜索词数据。',
  },
};
