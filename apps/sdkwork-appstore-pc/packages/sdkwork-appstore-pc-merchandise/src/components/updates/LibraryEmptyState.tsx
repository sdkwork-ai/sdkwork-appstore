import React from 'react';
import { FolderHeart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LibraryEmptyState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16 bg-store-subtle/40 dark:bg-store-surface rounded-store-card border border-store-line ">
      <FolderHeart className="w-12 h-12 text-store-ink-faint mx-auto mb-3" />
      <p className="text-sm font-bold text-store-ink-soft ">{t('updates.library.emptyTitle')}</p>
      <p className="text-xs text-store-ink-faint mt-1 max-w-sm mx-auto">
        {t('updates.library.emptySubtitle')}
      </p>
    </div>
  );
};

