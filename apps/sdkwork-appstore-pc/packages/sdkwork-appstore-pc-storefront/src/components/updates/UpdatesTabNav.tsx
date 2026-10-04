import React from 'react';
import { Download, FolderHeart, Sparkle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type UpdatesTabType = 'downloads' | 'library' | 'new';

interface UpdatesTabNavProps {
  currentTab: UpdatesTabType;
  onSelectTab: (tab: UpdatesTabType) => void;
  pendingUpdatesCount: number;
  installedAppsCount: number;
}

export const UpdatesTabNav: React.FC<UpdatesTabNavProps> = ({
  currentTab,
  onSelectTab,
  pendingUpdatesCount,
  installedAppsCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 border-b border-store-line pb-3 ">
      <button
        onClick={() => onSelectTab('downloads')}
        className={`flex items-center gap-2 px-4 py-2 rounded-store-control text-xs font-medium transition-all relative cursor-pointer ${
          currentTab === 'downloads'
            ? 'bg-store-brand text-white shadow-sm'
            : 'text-store-ink-soft hover:bg-store-raised/60 dark:hover:bg-store-surface '
        }`}
      >
        <Download className="w-4 h-4" />
        <span>{t('updates.tabs.downloads')}</span>
        {pendingUpdatesCount > 0 && (
          <span
            className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
              currentTab === 'downloads' ? 'bg-store-surface text-store-brand' : 'bg-store-brand text-white'
            }`}
          >
            {pendingUpdatesCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('library')}
        className={`flex items-center gap-2 px-4 py-2 rounded-store-control text-xs font-medium transition-all cursor-pointer ${
          currentTab === 'library'
            ? 'bg-store-brand text-white shadow-sm'
            : 'text-store-ink-soft hover:bg-store-raised/60 dark:hover:bg-store-surface '
        }`}
      >
        <FolderHeart className="w-4 h-4" />
        <span>{t('updates.tabs.library')}</span>
        <span
          className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
            currentTab === 'library'
              ? 'bg-store-surface text-store-brand'
              : 'bg-store-raised text-store-ink-soft '
          }`}
        >
          {installedAppsCount}
        </span>
      </button>

      <button
        onClick={() => onSelectTab('new')}
        className={`flex items-center gap-2 px-4 py-2 rounded-store-control text-xs font-medium transition-all cursor-pointer ${
          currentTab === 'new'
            ? 'bg-store-brand text-white shadow-sm'
            : 'text-store-ink-soft hover:bg-store-raised/60 dark:hover:bg-store-surface '
        }`}
      >
        <Sparkle className="w-4 h-4" />
        <span>{t('updates.tabs.whatsNew')}</span>
      </button>
    </div>
  );
};

