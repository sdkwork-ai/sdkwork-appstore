/**
 * Locale fragment: 应用管理域（`adminListings`）。
 *
 * Owned by `@sdkwork/appstore-pc-admin-listings`
 * (`I18N_SPEC.md` §6.1: `src/i18n/<locale>/appstore/admin/<fragment>.ts`).
 */
export const adminListings = {
  title: '应用管理',
  list: {
    title: '应用列表',
    description: '按上架状态筛选应用，查看应用详情并调整商店可见性。',
    filterStatus: '上架状态',
    filterStatusAll: '全部状态',
    columns: {
      listing: '应用',
      listingCode: '应用编码',
      status: '上架状态',
      visibility: '商店可见性',
      publisher: '开发者',
      updatedAt: '更新时间',
      actions: '操作',
    },
    empty: '当前筛选条件下没有应用。',
    loadFailed: '应用列表加载失败。',
    detail: '查看详情',
  },
  detail: {
    title: '应用详情',
    description: '查看应用的上架信息、商店可见性与运营指标。',
    back: '返回列表',
    notFound: '未找到该应用，可能已被删除或撤回。',
    fields: {
      listingId: '应用编号',
      listingCode: '应用编码',
      displayName: '应用名称',
      publisherName: '开发者名称',
      publisherId: '开发者编号',
      categoryCode: '分类编码',
      platform: '平台',
      latestReleaseVersion: '最新版本',
      updatedAt: '更新时间',
    },
    actions: { changeVisibility: '变更可见性' },
  },
  metrics: {
    title: '应用指标',
    description: '后端返回区间内的商店曝光与转化表现。',
    empty: '所选区间内没有指标数据。',
    loadFailed: '应用指标加载失败。',
    series: '每日明细',
    kpi: {
      impressions: '曝光量',
      pageViews: '详情页访问',
      installs: '安装量',
      uninstalls: '卸载量',
      conversionRatio: '转化率',
      averageRating: '平均评分',
    },
    columns: {
      date: '日期',
      impressions: '曝光量',
      pageViews: '详情页访问',
      installs: '安装量',
      uninstalls: '卸载量',
    },
  },
  visibilityChange: {
    title: '变更商店可见性',
    description: '可见性变更将立即作用于商店前台展示。',
    storefrontVisibility: '商店可见性',
    reason: '变更原因',
    reasonHint: '记录变更依据，便于审计与复盘。',
    submit: '提交变更',
    submitting: '提交中…',
    success: '商店可见性已更新。',
    failed: '商店可见性变更失败。',
  },
  status: {
    DRAFT: '草稿',
    IN_REVIEW: '审核中',
    PUBLISHED: '已上架',
    UNPUBLISHED: '已下架',
    DELISTED: '已停止分发',
    SUSPENDED: '已封禁',
    REJECTED: '已驳回',
  },
  visibilityStatus: {
    VISIBLE: '可展示',
    HIDDEN: '已隐藏',
    DELISTED: '已下架',
    REGION_RESTRICTED: '区域受限',
  },
  unknownToken: '未知状态（{{token}}）',
};
