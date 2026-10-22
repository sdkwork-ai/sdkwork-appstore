import React, { useEffect, useState } from 'react';
import { Heart, Share } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { AppItem, DistributionAction } from '@sdkwork/appstore-pc-core';
import {
  openDistributionUrl,
  paidPricing,
  primaryDistributionAction,
  resolveInstallPlan,
} from '@sdkwork/appstore-pc-core';
import { DistributionActions } from '@sdkwork/appstore-pc-commons';
import { useInstall } from '../../providers/InstallProvider';
import { AppStoreService } from '../../services/api';
import { formatPrice } from '../../lib/utils';
import { AddToCategoryPopover } from '../user-store/AddToCategoryPopover';
import { AppInstallButton } from './AppInstallButton';

interface AppHeaderActionsProps {
  app: AppItem;
}

export const AppHeaderActions: React.FC<AppHeaderActionsProps> = ({ app }) => {
  const { t, i18n } = useTranslation();
  const { installApp, requestQr, host } = useInstall();
  const [wishlisted, setWishlisted] = useState(false);

  // One plan for the header: the install call to action renders from it, and
  // the fallback acquire button is only used when the listing has no desktop
  // build at all (web, mobile, or mini-program distribution).
  const plan = resolveInstallPlan(app, host);
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

  const fallbackLabel = primary?.kind === 'open'
    ? t('common.distribution.openPcWeb')
    : paidPricing(app.pricingModel)
      ? app.price > 0
        ? formatPrice(app.price, i18n.language)
        : t('appDetail.install.buy')
      : t('appDetail.header.get');

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-start gap-3">
        {plan.status === 'no-desktop-build' ? (
          <button
            type="button"
            onClick={() => installApp(app)}
            className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full bg-store-brand px-5 py-2 text-sm font-medium text-store-on-brand transition-colors hover:bg-store-brand-hover"
          >
            {fallbackLabel}
          </button>
        ) : (
          <AppInstallButton app={app} plan={plan} />
        )}
        <div className="flex h-10 items-center gap-3">
          <button
            type="button"
            aria-label={t('appDetail.header.wishlist')}
            onClick={handleToggleWishlist}
            className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-xs font-medium transition-colors ${
              wishlisted
                ? 'bg-store-danger/10 text-store-danger'
                : 'bg-store-raised text-store-ink-faint hover:bg-store-subtle'
            }`}
          >
            <Heart className={`h-5 w-5 ${wishlisted ? 'fill-current' : ''}`} />
          </button>
          {/* 收入自定义分类：个人 Appstore 收录入口 */}
          <AddToCategoryPopover listingId={app.id} />
          <button
            type="button"
            aria-label={t('appDetail.header.share')}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-store-raised text-xs font-medium text-store-brand transition-colors hover:bg-store-subtle"
          >
            <Share className="h-5 w-5" />
          </button>
        </div>
      </div>
      {/* Per-distribution actions: web open and scan entries. Desktop builds
          are owned by the install call to action above. */}
      <DistributionActions
        app={app}
        onOpen={handleOpen}
        onQr={(target, action) => requestQr(target, action.group)}
      />
    </div>
  );
};
