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
    <div className="flex items-center gap-2 border-b border-gray-200 dark:border-[#22252e] pb-3">
      <button
        onClick={() => onSelectTab('downloads')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative cursor-pointer ${
          currentTab === 'downloads'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-[#20232c]'
        }`}
      >
        <Download className="w-4 h-4" />
        <span>{t('updates.tabs.downloads')}</span>
        {pendingUpdatesCount > 0 && (
          <span
            className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
              currentTab === 'downloads' ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
            }`}
          >
            {pendingUpdatesCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onSelectTab('library')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          currentTab === 'library'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-[#20232c]'
        }`}
      >
        <FolderHeart className="w-4 h-4" />
        <span>{t('updates.tabs.library')}</span>
        <span
          className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
            currentTab === 'library'
              ? 'bg-white text-blue-600'
              : 'bg-gray-200 dark:bg-[#2c303c] text-gray-700 dark:text-gray-300'
          }`}
        >
          {installedAppsCount}
        </span>
      </button>

      <button
        onClick={() => onSelectTab('new')}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          currentTab === 'new'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-[#20232c]'
        }`}
      >
        <Sparkle className="w-4 h-4" />
        <span>{t('updates.tabs.whatsNew')}</span>
      </button>
    </div>
  );
};

