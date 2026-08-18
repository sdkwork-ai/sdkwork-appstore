export const admin = {
  accessDenied: {
    title: 'Operations access denied',
    description: 'Your account does not have system monitoring permission.'
  },
  header: {
    badge: 'Operations Hub',
    title: 'Storefront Dashboard & Moderation Queue',
    subtitle: 'Storefront scale statistics, pending moderation queue, and review decisions.',
    refreshBtn: 'Refresh Status',
    refreshing: 'Refreshing...'
  },
  metrics: {
    cpu: 'Avg CPU Load',
    cpuUsage: 'CPU Utilization',
    memory: 'Memory Usage',
    memUsage: 'Memory Usage',
    requests: 'API QPS',
    qps: 'Throughput QPS',
    responseTime: 'Response Time < 12ms',
    activeSessions: 'Active Sessions',
    uptime: 'System Uptime',
    sla: 'SLA Uptime',
    allNodesNormal: 'All Nodes Operational'
  },
  dashboard: {
    title: 'Storefront Overview',
    totalListings: 'Total Listings',
    totalDownloads: 'Total Downloads',
    totalReviews: 'Total Reviews',
    pendingModeration: 'Pending Review',
    activePublishers: 'Active Publishers',
    dailyInstalls: 'Installs Today'
  },
  moderation: {
    title: 'Moderation Queue',
    empty: 'No submissions waiting for review',
    unavailable: 'Moderation queue unavailable (backend not ready or permission denied)',
    listing: 'Listing',
    submissionType: 'Type',
    status: 'Status',
    submittedAt: 'Submitted',
    statusPending: 'Pending',
    statusInReview: 'In Review',
    statusDecided: 'Decided',
    approve: 'Approve',
    reject: 'Reject',
    requestChanges: 'Request Changes',
    reasonPlaceholder: 'Decision reason (optional)',
    deciding: 'Submitting decision...',
    decided: 'Decision submitted'
  },
  unavailable: {
    title: 'Unavailable',
    description: 'Cluster node management and system audit logs are not provided by the backend yet. The dashboard and moderation queue remain available.'
  },
  cluster: {
    title: 'Distributed Cluster Nodes Status',
    nodeName: 'Node Name',
    region: 'Region',
    status: 'Status',
    latency: 'Latency',
    load: 'Node Load',
    restartNode: 'Restart Cluster Node',
    ports: 'Port:',
    restartSuccess: 'Restart signal sent for node [{{name}}]',
    thService: 'Service Component',
    thNodeId: 'Node ID',
    thPort: 'Port',
    thStatus: 'Status',
    thLatency: 'Latency',
    thActions: 'Actions',
    healthy: 'Healthy',
    highLoad: 'High Load'
  },
  audit: {
    title: 'System Security Audit Log',
    timestamp: 'Timestamp',
    user: 'User',
    action: 'Action',
    ip: 'Source IP',
    status: 'Result',
    exportCsv: 'Export CSV',
    noLogs: 'No logs found for level {{level}}'
  },
  loading: 'Loading system monitoring data...'
};
