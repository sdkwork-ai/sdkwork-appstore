import React from 'react';
import { Link } from 'react-router-dom';
import { HeartOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';
import { formatPrice } from '../../lib/utils';

interface WishlistCardProps {
  app: AppItem;
  onRemove: (appId: string) => void;
}

export function WishlistCard({ app, onRemove }: WishlistCardProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="p-4 bg-gray-100/60 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl hover:border-gray-300 dark:hover:border-[#2f3342] transition-all">
      <Link to={`/app/${app.id}`} className="flex items-center gap-3 min-w-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${app.iconColor}`}
        >
          <DynamicIcon name={app.icon} className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate hover:underline">
            {app.name}
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
            {app.developer} · {app.category}
          </p>
          <span className="inline-block mt-1 px-1.5 py-0.5 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
            {app.price === 0 ? t('wishlist.grid.free') : formatPrice(app.price, i18n.language)}
          </span>
        </div>
      </Link>
      <button
        onClick={() => onRemove(app.id)}
        className="mt-3 w-full px-3 py-1.5 rounded-xl text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center gap-1 cursor-pointer"
      >
        <HeartOff className="w-3.5 h-3.5" />
        {t('wishlist.grid.remove')}
      </button>
    </div>
  );
}
