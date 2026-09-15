import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Boxes, Download, ShieldAlert, Star, TrendingUp, Users } from 'lucide-react';
import type { AppstoreAdminDashboardSummary } from '@sdkwork/appstore-pc-admin-core';
import { AdminKpiCard, type AdminKpiCardProps } from '@sdkwork/appstore-pc-admin-shell';

/** One summary field bound to its localized label, glyph, and tone. */
interface DashboardKpiDefinition {
  field: keyof AppstoreAdminDashboardSummary;
  labelKey: string;
  icon: ReactNode;
  tone: NonNullable<AdminKpiCardProps['tone']>;
}

const KPI_DEFINITIONS: readonly DashboardKpiDefinition[] = [
  {
    field: 'totalListings',
    labelKey: 'adminDashboard.overview.kpi.totalListings',
    icon: <Boxes className="h-4 w-4" />,
    tone: 'neutral',
  },
  {
    field: 'totalDownloads',
    labelKey: 'adminDashboard.overview.kpi.totalDownloads',
    icon: <Download className="h-4 w-4" />,
    tone: 'info',
  },
  {
    field: 'totalReviews',
    labelKey: 'adminDashboard.overview.kpi.totalReviews',
    icon: <Star className="h-4 w-4" />,
    tone: 'positive',
  },
  {
    field: 'pendingModeration',
    labelKey: 'adminDashboard.overview.kpi.pendingModeration',
    icon: <ShieldAlert className="h-4 w-4" />,
    tone: 'warning',
  },
  {
    field: 'activePublishers',
    labelKey: 'adminDashboard.overview.kpi.activePublishers',
    icon: <Users className="h-4 w-4" />,
    tone: 'info',
  },
  {
    field: 'dailyInstalls',
    labelKey: 'adminDashboard.overview.kpi.dailyInstalls',
    icon: <TrendingUp className="h-4 w-4" />,
    tone: 'positive',
  },
];

export interface DashboardKpiGridProps {
  /** Normalized KPI snapshot returned by the dashboard service port. */
  summary: AppstoreAdminDashboardSummary;
  /** Renders value skeletons while a read is in flight. */
  loading: boolean;
}

/** Responsive operator KPI grid over one dashboard snapshot. */
export function DashboardKpiGrid({ loading, summary }: DashboardKpiGridProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {KPI_DEFINITIONS.map((definition) => (
        <AdminKpiCard
          key={definition.field}
          icon={definition.icon}
          label={t(definition.labelKey)}
          loading={loading}
          tone={definition.tone}
          value={summary[definition.field]}
        />
      ))}
    </div>
  );
}
