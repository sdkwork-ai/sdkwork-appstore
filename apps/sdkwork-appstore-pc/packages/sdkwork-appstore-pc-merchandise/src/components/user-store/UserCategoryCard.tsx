import { useTranslation } from 'react-i18next';
import { Folder, Share2, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { useState } from 'react';
import type { UserCategory } from '../../services/api';

interface UserCategoryCardProps {
  category: UserCategory;
  onOpen: (category: UserCategory) => void;
  onEdit: (category: UserCategory) => void;
  onDelete: (category: UserCategory) => void;
  onShare: (category: UserCategory) => void;
}

export function UserCategoryCard({ category, onOpen, onEdit, onDelete, onShare }: UserCategoryCardProps) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(category)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen(category);
      }}
      className="group relative flex flex-col gap-3 p-5 rounded-3xl bg-white dark:bg-[#181a20] border border-gray-200 dark:border-[#262933] hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:shadow-lg transition-all cursor-pointer select-none"
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/15 text-indigo-500 flex items-center justify-center shrink-0">
          <Folder className="w-5 h-5" />
        </div>
        <div className="relative">
          <button
            type="button"
            aria-label={t('common.accessibility.openMenu')}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((open) => !open);
            }}
            className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#222530] transition-colors cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute right-0 top-9 z-40 w-40 rounded-2xl bg-white dark:bg-[#181a20] border border-gray-200 dark:border-[#262933] shadow-xl py-1.5 text-sm">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(category); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#222530] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t('userStore.actions.edit')}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onShare(category); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-[#222530] cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {t('userStore.actions.manageShare')}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(category); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {t('userStore.actions.delete')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="min-w-0">
        <h3 className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{category.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {t('userStore.category.itemCount', { count: category.itemCount })}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onShare(category); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          {t('userStore.actions.manageShare')}
        </button>
      </div>
    </div>
  );
}
