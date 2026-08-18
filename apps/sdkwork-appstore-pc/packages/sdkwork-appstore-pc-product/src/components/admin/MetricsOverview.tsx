import React from 'react';
import { Cpu, HardDrive, Activity, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MetricCard } from './MetricCard';

export interface MonitorMetrics {
  cpuUsage: number;
  memUsage: number;
  activeSockets: number;
  requestsPerSec: number;
  uptimeDays: number;
}

interface MetricsOverviewProps {
  metrics: MonitorMetrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title={t('admin.metrics.cpuUsage', 'CPU 利用率')}
        icon={<Cpu className="w-4 h-4 text-blue-500" />}
        value={`${metrics.cpuUsage}%`}
        progress={metrics.cpuUsage}
        progressColor="bg-blue-500"
      />

      <MetricCard
        title={t('admin.metrics.memUsage', '内存使用率')}
        icon={<HardDrive className="w-4 h-4 text-purple-500" />}
        value={`${metrics.memUsage}%`}
        progress={metrics.memUsage}
        progressColor="bg-purple-500"
      />

      <MetricCard
        title={t('admin.metrics.qps', '吞吐量 QPS')}
        icon={<Activity className="w-4 h-4 text-emerald-500" />}
        value={
          <>
            {metrics.requestsPerSec} <span className="text-xs font-normal text-gray-400">req/s</span>
          </>
        }
        badge={
          <span className="text-[11px] text-emerald-500 font-semibold inline-block">
            ● {t('admin.metrics.responseTime', '响应耗时 < 12ms')}
          </span>
        }
      />

      <MetricCard
        title={t('admin.metrics.sla', '服务在线率 SLA')}
        icon={<Server className="w-4 h-4 text-teal-500" />}
        value={`${metrics.uptimeDays}%`}
        badge={
          <span className="text-[11px] text-teal-400 font-semibold inline-block">
            {t('admin.metrics.allNodesNormal', '所有节点工作正常')}
          </span>
        }
      />
    </div>
  );
};

