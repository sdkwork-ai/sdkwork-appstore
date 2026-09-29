import React, { useEffect, useState } from 'react';
import { Heart, Share } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useInstall } from '../../providers/InstallProvider';
import { AppStoreService } from '../../services/api';
import { AddToCategoryPopover } from '../user-store/AddToCategoryPopover';

interface AppHeaderActionsProps {
  app: AppItem;
}

export const AppHeaderActions: React.FC<AppHeaderActionsProps> = ({ app }) => {
  const { t, i18n } = useTranslation();
  const { installApp } = useInstall();
  const [wishlisted, setWishlisted] = useState(false);

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

  return (
    <div className="flex items-center gap-3">
      <button 
        type="button"
        onClick={() => installApp(app)}
        className="bg-store-brand text-white px-8 py-2 rounded-full font-medium text-sm hover:bg-store-brand transition-colors shadow-lg shadow-blue-100 dark:shadow-none uppercase tracking-wide cursor-pointer"
      >
        {app.price === 0 ? t('appDetail.header.get') : formatPrice(app.price, i18n.language)}
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
  );
};

