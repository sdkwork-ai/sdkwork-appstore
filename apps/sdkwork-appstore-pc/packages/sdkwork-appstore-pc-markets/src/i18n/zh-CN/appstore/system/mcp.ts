export const mcp = {
  header: {
    badge: 'MCP 上下文协议',
    title: 'MCP 服务中心',
    subtitle: '打通 AI 大模型与本地/云端数据源，一键连接数据库、API 接口、文件系统与协作软件。',
    deployBtn: '部署 / 连接新的 MCP Server',
    addBtn: '部署 / 连接新的 MCP Server'
  },
  filter: {
    searchPlaceholder: '搜索 MCP 服务名称、端点类型或工具函数...',
    allCategories: '全部 MCP 分类',
    database: '数据库服务',
    cloud: '云端 API',
    tools: '实用开发工具',
    knowledge: '知识库 & 文档'
  },
  modal: {
    title: 'MCP 服务配置生成器',
    registerTitle: '注册 / 添加 MCP 上下文服务器',
    registerSubtitle: '连接本地 Stdio 或 Cloud SSE 协议的 Context Provider',
    transport: '传输协议',
    command: '启动命令',
    args: '环境变量与参数',
    configSnippet: 'Claude Desktop / Cursor 配置文件代码',
    copyConfig: '配置 JSON',
    copiedConfig: '已复制配置 JSON',
    statusBadge: '服务运行状态',
    toolsCount: '声明 {{count}} 个 MCP 工具集',
    connected: '已建立 MCP 管道',
    connect: '连接 MCP',
    configJson: '配置 JSON',
    connectMcp: '连接 MCP',
    configTitle: '配置生成器',
    subtitle: '连接本地 Stdio 或 Cloud SSE 协议的 Context Provider',
    tabJson: '配置 JSON',
    tabSandbox: '沙盒测试',
    selectTool: '选择 Tool',
    executingTool: '执行中...',
    triggerTool: '触发 Tool',
    argsJson: '参数 JSON',
    responseHeader: '响应结果',
    latency: '延迟',
    toolsProvided: '提供 Tool API ({{count}})'
  },
  form: {
    addTitle: '注册 / 添加 MCP 上下文服务器',
    nameLabel: 'MCP 服务名称',
    namePlaceholder: '如: Postgres DB Connector',
    transportLabel: '通信传输模式',
    publisherLabel: '发布方 / 组织',
    serverName: 'MCP 服务名称',
    serverNamePlaceholder: '如: Postgres DB Connector',
    transportMode: '通信传输模式',
    publisher: '发布方 / 组织',
    publisherPlaceholder: '例如: Anthropic Official / Custom Org',
    commandLabel: '启动命令 / Endpoint URL',
    commandPlaceholder: '如: npx -y @modelcontextprotocol/server-postgres',
    toolsLabel: '声明提供的工具列表（逗号分隔）',
    toolsPlaceholder: '如: query, inspect_schema, list_tables',
    descLabel: '服务描述',
    descPlaceholder: '输入服务的作用说明...',
    submitBtn: '添加并测试连接'
  },
  status: {
    active: '运行中 / 已在线',
    idle: '空闲 / 待连接',
    offline: '未连接 / 已离线',
    disconnected: '未连接 / 已离线',
    error: '通信服务异常'
  },
  empty: {
    title: '未找到匹配的 MCP 服务',
    subtitle: '请尝试更换搜索关键字'
  },
  loading: '加载 MCP 服务列表中...'
};

