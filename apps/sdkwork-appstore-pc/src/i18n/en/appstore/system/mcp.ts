export const mcp = {
  header: {
    badge: 'Model Context Protocol',
    title: 'MCP Servers & Context Integration Hub',
    subtitle: 'Bridge LLMs with local/cloud data sources. Connect databases, external APIs, filesystems, and developer tools seamlessly.',
    deployBtn: 'Deploy / Connect New MCP Server',
    addBtn: 'Deploy / Connect New MCP Server'
  },
  filter: {
    searchPlaceholder: 'Search MCP servers, endpoint types, or export tools...',
    allCategories: 'All MCP Categories',
    database: 'Databases',
    cloud: 'Cloud APIs',
    tools: 'Developer Tools',
    knowledge: 'Knowledge & Docs'
  },
  modal: {
    title: 'MCP Server Configuration Generator',
    registerTitle: 'Register / Add MCP Context Server',
    registerSubtitle: 'Connect local Stdio or Cloud SSE protocol Context Providers',
    transport: 'Transport Protocol',
    command: 'Executable Command',
    args: 'Arguments & Environment Variables',
    configSnippet: 'Claude Desktop / Cursor Config JSON',
    copyConfig: 'Config JSON',
    copiedConfig: 'Config JSON Copied',
    statusBadge: 'Service Status',
    toolsCount: 'Declares {{count}} MCP tool(s)',
    connected: 'MCP Channel Connected',
    connect: 'Connect MCP',
    configJson: 'Config JSON',
    connectMcp: 'Connect MCP',
    configTitle: 'Configuration Generator',
    subtitle: 'Connect local Stdio or Cloud SSE protocol Context Providers',
    tabJson: 'Config JSON',
    tabSandbox: 'Sandbox Test',
    selectTool: 'Select Tool',
    executingTool: 'Executing...',
    triggerTool: 'Trigger Tool',
    argsJson: 'Arguments JSON',
    responseHeader: 'Response',
    latency: 'Latency',
    toolsProvided: 'Provides Tool API ({{count}})'
  },
  form: {
    addTitle: 'Register / Add MCP Context Server',
    nameLabel: 'MCP Server Name',
    namePlaceholder: 'e.g. Postgres DB Connector',
    transportLabel: 'Transport Protocol',
    publisherLabel: 'Publisher / Organization',
    serverName: 'MCP Server Name',
    serverNamePlaceholder: 'e.g. Postgres DB Connector',
    transportMode: 'Transport Protocol',
    publisher: 'Publisher / Organization',
    publisherPlaceholder: 'e.g. Anthropic Official / Custom Org',
    commandLabel: 'Command / Endpoint URL',
    commandPlaceholder: 'e.g. npx -y @modelcontextprotocol/server-postgres',
    toolsLabel: 'Declared Tools List (Comma separated)',
    toolsPlaceholder: 'e.g. query, inspect_schema, list_tables',
    descLabel: 'Description',
    descPlaceholder: 'Enter description of server role...',
    submitBtn: 'Add & Test Connection'
  },
  status: {
    active: 'Active / Connected',
    idle: 'Idle / Standby',
    offline: 'Disconnected',
    disconnected: 'Disconnected',
    error: 'Service Error'
  },
  empty: {
    title: 'No matching MCP servers found',
    subtitle: 'Try changing search keywords'
  },
  loading: 'Loading MCP servers list...'
};

