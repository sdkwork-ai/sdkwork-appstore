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
      className="group relative flex flex-col gap-3 p-5 rounded-store-card bg-store-surface border border-store-line hover:border-store-brand dark:hover:border-store-brand/40 hover:shadow-lg transition-all cursor-pointer select-none "
    >
      <div className="flex items-start justify-between">
        <div className="w-11 h-11 rounded-store-card bg-store-brand/10 dark:bg-store-brand/15 text-store-brand flex items-center justify-center shrink-0">
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
            className="p-1.5 rounded-full text-store-ink-faint hover:text-store-ink-soft hover:bg-store-subtle transition-colors cursor-pointer text-xs font-medium"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
              <div className="absolute right-0 top-9 z-40 w-40 rounded-store-card bg-store-surface border border-store-line shadow-xl py-1.5 text-sm ">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onEdit(category); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-store-subtle cursor-pointer rounded-store-control text-sm font-medium"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  {t('userStore.actions.edit')}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onShare(category); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-store-subtle cursor-pointer rounded-store-control text-sm font-medium"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {t('userStore.actions.manageShare')}
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onDelete(category); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-left text-store-danger hover:bg-store-danger-soft cursor-pointer rounded-store-control text-sm font-medium"
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
        <h3 className="text-sm font-semibold truncate text-store-ink ">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-xs text-store-ink-faint mt-1 line-clamp-2">{category.description}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-store-ink-faint">
          {t('userStore.category.itemCount', { count: category.itemCount })}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onShare(category); }}
          className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-store-brand bg-store-brand-soft dark:bg-store-brand/10 hover:bg-store-brand-soft dark:hover:bg-store-brand/20 transition-colors cursor-pointer "
        >
          <Share2 className="w-3.5 h-3.5" />
          {t('userStore.actions.manageShare')}
        </button>
      </div>
    </div>
  );
}
