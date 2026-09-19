import React from 'react';
import { useTranslation } from 'react-i18next';
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
    <div className="flex items-center justify-between p-3.5 bg-white dark:bg-[#20232b] rounded-xl border border-gray-200/60 dark:border-[#2b2f3a] hover:border-gray-300 dark:hover:border-[#3a3f4e] transition-colors">
      <div>
        <h3 className="font-bold text-xs text-gray-900 dark:text-gray-100">{app.name}</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {t('console.managed.version', '版本')} v{app.version} • {t('console.managed.downloads', '下载量')} {app.downloads}
        </p>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
          isLive
            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
        }`}
      >
        {formatStatus(app.status)}
      </span>
    </div>
  );
};
