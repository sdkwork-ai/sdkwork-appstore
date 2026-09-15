/**
 * Shell locale fragment: operator console chrome.
 *
 * Owned by `@sdkwork/appstore-pc-admin-shell`; key prefix `adminShell` matches
 * the fragment namespace (`I18N_SPEC.md` §5/§6).
 */
export const adminShell = {
  brand: {
    title: '运营控制台',
    subtitle: 'SDKWork 应用商店',
  },
  nav: {
    group: {
      insight: '数据分析',
      governance: '平台治理',
      operations: '目录运营',
      distribution: '渠道分发',
    },
    collapse: '收起导航',
    expand: '展开导航',
  },
  topbar: {
    operator: '操作员',
    tenant: '租户',
    role: {
      platformAdministrator: '平台管理员',
      operator: '运营人员',
    },
  },
  breadcrumb: {
    home: '控制台',
  },
  accessDenied: {
    title: '无权访问运营控制台',
    description: '当前账号未被授予应用商店后台权限，请联系平台管理员开通后重试。',
    requiredPermission: '所需权限',
  },
  pageDenied: {
    title: '权限不足',
    description: '当前账号缺少访问该页面所需的权限，请联系平台管理员开通。',
  },
  notFound: {
    title: '页面不存在',
    description: '请求的运营页面不存在或已下线。',
    back: '返回控制台',
  },
  state: {
    loading: '加载中…',
    empty: '暂无数据',
    retry: '重试',
    error: {
      title: '加载失败',
      description: '请稍后重试；若持续失败，请联系平台管理员并提供追踪标识。',
    },
    unauthorized: {
      title: '登录状态已失效',
      description: '请重新登录后继续操作。',
    },
    forbidden: {
      title: '权限不足',
      description: '当前账号无权访问该数据。',
    },
    notFound: {
      title: '数据不存在',
      description: '请求的资源不存在或已被移除。',
    },
    runtimeUnconfigured: {
      title: '后台运行时未就绪',
      description: '运营控制台尚未完成初始化，请刷新页面重试。',
    },
  },
  errorDetail: {
    code: '错误码',
    operation: '操作',
    traceId: '追踪标识',
    field: '字段',
  },
  common: {
    refresh: '刷新',
    cancel: '取消',
    confirm: '确认',
    submit: '提交',
    close: '关闭',
    search: '搜索',
    reset: '重置',
    save: '保存',
    detail: '详情',
    back: '返回',
    actions: '操作',
    all: '全部',
    none: '无',
    notAvailable: '—',
    totalItems: '共 {{total}} 条',
    page: '第 {{page}} / {{totalPages}} 页',
    nextPage: '下一页',
    previousPage: '上一页',
    lastUpdated: '最后更新：{{time}}',
    paginationPrevHint: '返回上一页',
    paginationNextHint: '前往下一页',
  },
};
