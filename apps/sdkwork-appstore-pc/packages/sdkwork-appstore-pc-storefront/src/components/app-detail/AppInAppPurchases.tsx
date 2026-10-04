import { useTranslation } from 'react-i18next';
import { InAppPurchase } from '../../types';
import { formatPrice } from '../../lib/utils';

interface AppInAppPurchasesProps {
  purchases?: InAppPurchase[];
}

export function AppInAppPurchases({ purchases }: AppInAppPurchasesProps) {
  const { t, i18n } = useTranslation();

  if (!purchases || purchases.length === 0) return null;

  return (
    <div className="pt-8 border-t border-store-line-soft mt-10 ">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-store-ink ">{t('appDetail.inAppPurchases.title')}</h3>
      </div>
      <div className="flex flex-col">
        {purchases.map((iap, idx) => (
          <div key={iap.id || idx} className="flex justify-between items-center py-3 border-b border-store-line-soft last:border-0 ">
            <span className="text-sm text-store-ink font-medium ">{iap.name}</span>
            <span className="text-sm text-store-ink-faint ">{formatPrice(iap.price, i18n.language)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

