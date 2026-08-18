import React from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LibraryEmptyState() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-[#20222a] flex items-center justify-center">
        <FolderOpen className="w-7 h-7 text-gray-400 dark:text-gray-500" />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {t('library.empty.title')}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
          {t('library.empty.subtitle')}
        </p>
      </div>
      <Link
        to="/apps"
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-colors"
      >
        {t('nav.menu.apps')}
      </Link>
    </div>
  );
}
