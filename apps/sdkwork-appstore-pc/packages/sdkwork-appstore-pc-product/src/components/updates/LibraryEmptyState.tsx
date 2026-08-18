import React from 'react';
import { FolderHeart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LibraryEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16 bg-gray-100/40 dark:bg-[#181a20] rounded-2xl border border-gray-200 dark:border-[#22252e]">
      <FolderHeart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
      <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{t('updates.library.emptyTitle')}</p>
      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
        {t('updates.library.emptySubtitle')}
      </p>
    </div>
  );
};

