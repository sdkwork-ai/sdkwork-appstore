import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PublishedApp } from './ManagedAppsList';

interface ManagedAppRowProps {
  app: PublishedApp;
}

export const ManagedAppRow: React.FC<ManagedAppRowProps> = ({ app }) => {
  const { t } = useTranslation();
  const isLive = app.status === '已上架' || app.status === 'Published';

  const formatStatus = (status: string) => {
    if (status === '已上架' || status === 'Published') return t('console.managed.statusPublished', '已上架');
    if (status === '审核中' || status === 'In Review') return t('console.managed.statusReviewing', '审核中');
    return status;
  };

  return (
    <Link
      to={`/publisher/apps/${app.id}`}
      className="flex items-center justify-between p-3.5 bg-store-surface rounded-store-control border border-store-line/60 dark:border-store-line hover:border-store-line-strong transition-colors card-press"
    >
      <div>
        <h3 className="font-bold text-xs text-store-ink ">{app.name}</h3>
        <p className="text-[11px] text-store-ink-faint mt-0.5">
          {t('console.managed.version', '版本')} v{app.version} • {t('console.managed.downloads', '下载量')} {app.downloads}
        </p>
      </div>
      <span
        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isLive
            ? 'bg-store-success/10 text-store-success border border-store-success/20'
            : 'bg-store-warning/10 text-store-warning border border-store-warning/20'
        }`}
      >
        {formatStatus(app.status)}
      </span>
    </Link>
  );
};
