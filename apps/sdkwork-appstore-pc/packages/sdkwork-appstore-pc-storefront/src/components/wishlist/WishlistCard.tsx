import React from 'react';
import { Link } from 'react-router-dom';
import { HeartOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { paidPricing } from '@sdkwork/appstore-pc-core';
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
    <div className="p-4 bg-store-subtle/60 dark:bg-store-surface border border-store-line rounded-store-card hover:border-store-line-strong transition-all ">
      <Link to={`/app/${app.id}`} className="flex items-center gap-3 min-w-0">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${app.iconColor}`}
        >
          <DynamicIcon name={app.icon} className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-bold text-store-ink truncate hover:underline ">
            {app.name}
          </h4>
          <p className="text-[11px] text-store-ink-faint truncate ">
            {app.developer} · {app.category}
          </p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-store-brand/10 text-store-brand text-xs font-medium ">
            {paidPricing(app.pricingModel) ? t('publisher.pricingPaid') : t('wishlist.grid.free')}
          </span>
        </div>
      </Link>
      <button
        onClick={() => onRemove(app.id)}
        className="mt-3 w-full px-3 py-1.5 rounded-store-control text-xs font-medium text-store-ink-faint hover:text-store-danger hover:bg-store-danger/10 transition-all flex items-center justify-center gap-1 cursor-pointer "
      >
        <HeartOff className="w-3.5 h-3.5" />
        {t('wishlist.grid.remove')}
      </button>
    </div>
  );
}
