import React, { useEffect, useState } from 'react';
import { Heart, Share } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppItem, DistributionAction } from '@sdkwork/appstore-pc-core';
import { DistributionActions } from '@sdkwork/appstore-pc-commons';
import { openDistributionUrl, paidPricing, primaryDistributionAction } from '@sdkwork/appstore-pc-core';
import { useInstall } from '../../providers/InstallProvider';
import { AppStoreService } from '../../services/api';
import { AddToCategoryPopover } from '../user-store/AddToCategoryPopover';

interface AppHeaderActionsProps {
  app: AppItem;
}

export const AppHeaderActions: React.FC<AppHeaderActionsProps> = ({ app }) => {
  const { t, i18n } = useTranslation();
  const { installApp, requestQr } = useInstall();
  const [wishlisted, setWishlisted] = useState(false);
  const primary = primaryDistributionAction(app);

  useEffect(() => {
    let cancelled = false;
    AppStoreService.getWishlist()
      .then((items) => {
        if (!cancelled) {
          setWishlisted(items.some((item) => item.id === app.id));
        }
      })
      .catch(() => {
        // anonymous sessions have no wishlist; keep the heart unchecked
      });
    return () => {
      cancelled = true;
    };
  }, [app.id]);

  const handleToggleWishlist = async () => {
    const next = !wishlisted;
    setWishlisted(next);
    try {
      if (next) {
        await AppStoreService.addToWishlist(app.id);
      } else {
        await AppStoreService.removeFromWishlist(app.id);
      }
    } catch (error) {
      // revert the optimistic toggle when the write fails
      setWishlisted(!next);
      console.error('Failed to update wishlist', error);
    }
  };

  const handleOpen = (action: DistributionAction) => {
    openDistributionUrl(action.url);
  };

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => installApp(app)}
          className="bg-store-brand text-white px-8 py-2 rounded-full font-medium text-sm hover:bg-store-brand transition-colors shadow-lg shadow-blue-100 dark:shadow-none uppercase tracking-wide cursor-pointer"
        >
          {primary?.kind === 'open'
            ? t('common.distribution.openPcWeb')
            : paidPricing(app.pricingModel)
              ? t('publisher.pricingPaid')
              : t('appDetail.header.get')}
        </button>
        <button
          type="button"
          aria-label={t('appDetail.header.wishlist')}
          onClick={handleToggleWishlist}
          className={`p-2 rounded-full transition-colors cursor-pointer text-xs font-medium${
            wishlisted
              ? 'bg-store-danger/10 text-store-danger '
              : 'bg-store-raised text-store-ink-faint hover:bg-store-raised '
          }`}
        >
          <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
        </button>
        {/* 收入自定义分类：个人 Appstore 收录入口 */}
        <AddToCategoryPopover listingId={app.id} />
        <button
          type="button"
          aria-label={t('appDetail.header.share')}
          className="p-2 bg-store-raised text-store-brand rounded-full hover:bg-store-raised transition-colors cursor-pointer text-xs font-medium"
        >
          <Share className="w-5 h-5" />
        </button>
      </div>
      {/* Per-distribution actions: web open, per-OS downloads, scan entries. */}
      <DistributionActions
        app={app}
        onOpen={handleOpen}
        onInstall={(target, platform) => installApp(target, platform)}
        onQr={(target, action) => requestQr(target, action.group)}
      />
    </div>
  );
};

