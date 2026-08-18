import React, { useEffect, useState } from 'react';
import { Heart, Share } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { formatPrice } from '../../lib/utils';
import { useInstall } from '../../providers/InstallProvider';
import { AppStoreService } from '../../services/api';

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
        className="bg-blue-600 text-white px-8 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 dark:shadow-none uppercase tracking-wide cursor-pointer"
      >
        {app.price === 0 ? t('appDetail.header.get') : formatPrice(app.price, i18n.language)}
      </button>
      <button 
        type="button"
        aria-label={t('appDetail.header.wishlist')}
        onClick={handleToggleWishlist}
        className={`p-2 rounded-full transition-colors cursor-pointer ${
          wishlisted
            ? 'bg-red-500/10 text-red-500 dark:text-red-400'
            : 'bg-gray-100 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3C3C3E]'
        }`}
      >
        <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
      </button>
      <button 
        type="button"
        aria-label={t('appDetail.header.share')}
        className="p-2 bg-gray-100 dark:bg-[#2C2C2E] text-blue-600 dark:text-[#0A84FF] rounded-full hover:bg-gray-200 dark:hover:bg-[#3C3C3E] transition-colors cursor-pointer"
      >
        <Share className="w-5 h-5" />
      </button>
    </div>
  );
};

