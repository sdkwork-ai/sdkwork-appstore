export const consoleLocales = {
  header: {
    badge: '开发者工作台',
    title: '开发者控制台',
    subtitle: '管理发布的应用、生成 API 凭证密钥、配置安全策略与审核发布新版本。'
  },
  tabs: {
    publish: '发布新应用',
    managed: '已发布应用管理',
    apiKeys: 'API 凭证与 SDK 密钥',
    security: '安全策略与访问限制'
  },
  alert: {
    success: '应用【{{appName}}】提交成功！已生成应用密钥并启动自动打标合规校验。'
  },
  form: {
    title: '填写应用发布资料',
    appName: '应用名称',
    appNamePlaceholder: '例如：SDKWork Code Master',
    category: '应用主分类',
    version: '版本号',
    versionPlaceholder: '1.0.0',
    price: '价格设置',
    pricePlaceholder: '免费请输入 0，或者填写付费金额',
    iconUrl: '应用 Icon 图标 URL',
    iconUrlPlaceholder: 'https://...',
    downloadUrl: '安装包下载链接 URL',
    downloadUrlPlaceholder: 'https://...',
    summary: '简短一句话描述',
    summaryPlaceholder: '描述应用核心功能与亮点...',
    description: '详细功能介绍与更新说明',
    descriptionPlaceholder: '详细说明产品的技术架构、版本说明与安装前提...',
    submit: '提交发布审核',
    success: '应用发布成功！已提交至平台审核队列。'
  },
  categories: {
    productivity: '高效工作',
    utilities: '实用程序与工具',
    entertainment: '娱乐影音',
    ai: 'AI 智能',
    games: '游戏'
  },
  managed: {
    title: '已管理与上架的应用列表 ({{count}})',
    titleCount: '已管理应用列表 ({{count}})',
    empty: '暂无已管理的应用记录',
    category: '分类:',
    status: '状态:',
    version: '版本',
    downloads: '下载量',
    statusPublished: '已上架',
    statusReviewing: '审核中'
  },
  apiKeys: {
    title: 'API 凭证与 SDK 密钥',
    cardTitle: 'API 密钥与 SDK 凭证',
    createBtn: '新建 Key',
    subtitle: '用于 Node.js / Python 后端集成 SDKWork API 接口的专属 Client Secret 凭证:',
    namePlaceholder: '密钥标识 (例如: Production Server Key)',
    submitBtn: '生成 API Secret',
    generateBtn: '生成新的 API 密钥',
    keyName: '密钥名称',
    secretKey: 'Secret Key',
    createdDate: '创建日期',
    status: '状态',
    actions: '操作',
    revoke: '作废密钥',
    active: '已生效',
    revoked: '已作废',
    envProd: '生产环境',
    envDev: '开发测试环境',
    lastUsed: '最近调用',
    neverUsed: '从未调用',
    copyKey: '复制 Key',
    copied: '已复制'
  },
  security: {
    title: '客户端安全与沙盒策略',
    crossOrigin: '跨域隔离与沙盒防范',
    ipWhitelist: 'IP 访问白名单',
    mfa: '开发者双因素认证',
    corsTitle: '跨域隔离与沙盒防范 (CORS & CSP)',
    corsDesc: '默认启用严格的同源策略、支持基于 API 密钥的 Header 校验，阻止非法网页盗刷。',
    ipTitle: 'IP 访问白名单 (IP Whitelist)',
    ipDesc: '限制仅允许预设的安全 IP 地址网段发起高权限后台 API 管理调用。',
    mfaTitle: '开发者双因素认证 (MFA Protection)',
    mfaDesc: '在进行敏感 API 密钥重新生成、作废或版本下架时强制二次验证。',
    enabledStatus: '已开启保护',
    unavailable: '安全策略能力暂未由 App Store 后端提供，当前保持安全默认配置。',
    mfaSubtitle: 'MFA Protection',
    ipSubtitle: 'IP Whitelist',
    complianceBadge: 'DJCP Level 3 Compliant'
  },
  loading: '加载开发者控制台数据中...'
};

