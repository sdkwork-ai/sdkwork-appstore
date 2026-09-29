import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LibraryEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 rounded-2xl border border-dashed border-store-line-strong ">
      <div className="w-14 h-14 rounded-store-card bg-store-subtle flex items-center justify-center ">
        <FolderOpen className="w-7 h-7 text-store-ink-faint " />
      </div>
      <div>
        <h3 className="text-sm font-bold text-store-ink ">
          {t('library.empty.title')}
        </h3>
        <p className="text-xs text-store-ink-faint mt-1 max-w-sm ">
          {t('library.empty.subtitle')}
        </p>
      </div>
      <Link
        to="/apps"
        className="px-4 py-2 bg-store-brand hover:bg-store-brand text-white rounded-full text-xs font-bold transition-colors"
      >
        {t('nav.menu.apps')}
      </Link>
    </div>
  );
}
