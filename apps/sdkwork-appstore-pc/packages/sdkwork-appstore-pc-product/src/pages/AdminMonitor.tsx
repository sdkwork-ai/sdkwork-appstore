import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Boxes, Download, MessageSquareQuote, Users, FileClock } from 'lucide-react';
import { MonitorHeader } from '../components/admin/MonitorHeader';
import { MetricCard } from '../components/admin/MetricCard';
import { ModerationQueueSection } from '../components/admin/ModerationQueueSection';
import { ClusterNodesTable } from '../components/admin/ClusterNodesTable';
import { SystemAuditLog } from '../components/admin/SystemAuditLog';
import { AdminMonitorService, ClusterNode, ModerationQueueItem, OperatorDashboard, SystemAuditEntry } from '../services/api';

export default function AdminMonitor() {
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboard, setDashboard] = useState<OperatorDashboard | undefined>();
  const [queue, setQueue] = useState<ModerationQueueItem[]>([]);
  const [queueUnavailable, setQueueUnavailable] = useState(false);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<ClusterNode[]>([]);
  const [logs, setLogs] = useState<SystemAuditEntry[]>([]);

  const loadData = useCallback(async () => {
    const [dash, queueItems, nodeList, logList] = await Promise.all([
      AdminMonitorService.getDashboard().catch(() => undefined),
      AdminMonitorService.getModerationQueue()
        .then((items) => {
          setQueueUnavailable(false);
          return items;
        })
        .catch(() => {
          setQueueUnavailable(true);
          return [];
        }),
      AdminMonitorService.getClusterNodes().catch(() => []),
      AdminMonitorService.getSystemAuditLogs().catch(() => []),
    ]);
    setDashboard(dash);
    setQueue(queueItems);
    setNodes(nodeList);
    setLogs(logList);
  }, []);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      AdminMonitorService.getDashboard()
        .then((dash) => {
          if (dash) {
            setDashboard(dash);
          }
        })
        .catch(() => {
          // keep the last snapshot when the endpoint is unavailable
        });
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDecide = async (reviewId: string, decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES', reason?: string) => {
    setDecidingId(reviewId);
    try {
      await AdminMonitorService.decideReview(reviewId, decision, reason);
      setQueue((prev) => prev.filter((item) => item.id !== reviewId));
    } catch (error) {
      console.error('Failed to record decision', error);
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-full space-y-6 select-none animate-fade-in">
      {/* Sub-component: Monitor Header */}
      <MonitorHeader
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Sub-component: Storefront Dashboard Stats */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          {t('admin.dashboard.title')}
        </h3>
        {dashboard ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <MetricCard
              title={t('admin.dashboard.totalListings')}
              icon={<Boxes className="w-4 h-4 text-blue-500" />}
              value={dashboard.totalListings}
            />
            <MetricCard
              title={t('admin.dashboard.totalDownloads')}
              icon={<Download className="w-4 h-4 text-emerald-500" />}
              value={dashboard.totalDownloads}
            />
            <MetricCard
              title={t('admin.dashboard.totalReviews')}
              icon={<MessageSquareQuote className="w-4 h-4 text-purple-500" />}
              value={dashboard.totalReviews}
            />
            <MetricCard
              title={t('admin.dashboard.pendingModeration')}
              icon={<FileClock className="w-4 h-4 text-amber-500" />}
              value={dashboard.pendingModeration}
            />
            <MetricCard
              title={t('admin.dashboard.activePublishers')}
              icon={<Users className="w-4 h-4 text-teal-500" />}
              value={dashboard.activePublishers}
            />
            <MetricCard
              title={t('admin.dashboard.dailyInstalls')}
              icon={<Download className="w-4 h-4 text-rose-500" />}
              value={dashboard.dailyInstalls}
            />
          </div>
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400 py-6 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            {t('admin.moderation.unavailable')}
          </p>
        )}
      </section>

      {/* Sub-component: Moderation Queue */}
      <ModerationQueueSection
        items={queue}
        unavailable={queueUnavailable}
        decidingId={decidingId}
        onDecide={handleDecide}
      />

      {/* Sub-component: Degraded Cluster & Audit Sections */}
      <div className="rounded-3xl p-5 bg-gray-100/50 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] space-y-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.unavailable.description')}</p>
        <ClusterNodesTable nodes={nodes} onRestartNode={async () => undefined} />
        <SystemAuditLog logs={logs} />
      </div>
    </div>
  );
}
