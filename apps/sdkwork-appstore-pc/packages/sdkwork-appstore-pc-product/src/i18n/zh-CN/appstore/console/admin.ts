export const admin = {
  accessDenied: {
    title: '无权访问运维中心',
    description: '当前账号缺少系统监控权限。'
  },
  header: {
    badge: '运维中心',
    title: '应用市场大盘与审核队列',
    subtitle: '查看应用市场上架规模、下载与评论大盘、待审核队列，并处理审核决议。',
    refreshBtn: '刷新状态',
    refreshing: '刷新中...'
  },
  metrics: {
    cpu: 'CPU 平均负载',
    cpuUsage: 'CPU 利用率',
    memory: '内存占用率',
    memUsage: '内存使用率',
    requests: '每秒 API QPS',
    qps: '吞吐量 QPS',
    responseTime: '响应耗时 < 12ms',
    activeSessions: '当前在线会话',
    uptime: '系统连续正常运行',
    sla: '服务在线率 SLA',
    allNodesNormal: '所有节点工作正常'
  },
  dashboard: {
    title: '市场大盘统计',
    totalListings: '应用总数',
    totalDownloads: '累计下载',
    totalReviews: '评论总数',
    pendingModeration: '待审核',
    activePublishers: '活跃开发者',
    dailyInstalls: '今日安装'
  },
  moderation: {
    title: '审核队列',
    empty: '暂无待审核申请',
    unavailable: '审核队列暂不可用（后端服务未就绪或权限不足）',
    listing: '应用',
    submissionType: '提交类型',
    status: '状态',
    submittedAt: '提交时间',
    statusPending: '待审核',
    statusInReview: '审核中',
    statusDecided: '已决议',
    approve: '通过',
    reject: '拒绝',
    requestChanges: '要求修改',
    reasonPlaceholder: '决议原因（可选）',
    deciding: '提交决议...',
    decided: '决议已提交'
  },
  unavailable: {
    title: '该能力暂不可用',
    description: '集群节点管理与系统审计日志暂未由后端提供，可继续使用市场大盘与审核队列。'
  },
  cluster: {
    title: '分布式集群节点状态',
    nodeName: '节点名称',
    region: '部署区域',
    status: '运行状态',
    latency: '网络延迟',
    load: '负载状况',
    restartNode: '重启集群节点',
    ports: '端口:',
    restartSuccess: '节点 [{{name}}] 重启指令已发送',
    thService: '服务组件',
    thNodeId: '集群节点 ID',
    thPort: '端口',
    thStatus: '状态',
    thLatency: '延迟',
    thActions: '运维操作',
    healthy: '运行良好',
    highLoad: '高负载'
  },
  audit: {
    title: '全量系统安全审计日志',
    timestamp: '发生时间',
    user: '操作用户',
    action: '执行动作',
    ip: '来源 IP',
    status: '审计结果',
    exportCsv: '导出 CSV',
    noLogs: '暂无 {{level}} 级别的日志记录'
  },
  loading: '加载系统监控数据中...'
};
