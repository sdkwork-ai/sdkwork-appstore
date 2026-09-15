import { useTranslation } from 'react-i18next';
import { AdminPageHeader } from '@sdkwork/appstore-pc-admin-shell';

import { CatalogFeaturedSlotForm } from '../components/CatalogFeaturedSlotForm';
import { CatalogReadGapNotice } from '../components/CatalogReadGapNotice';

/**
 * `catalog-featured` — featured-slot authoring console.
 *
 * The operator contract exposes featured-slot writes only, so the page is driven
 * by an operator-supplied slot code and states that limitation up front instead
 * of pretending to own a slot browser.
 */
export function CatalogFeaturedPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminCatalog.featured.description')}
        title={t('adminCatalog.featured.title')}
      />

      <CatalogReadGapNotice
        description={t('adminCatalog.featured.readGapNotice.description')}
        title={t('adminCatalog.featured.readGapNotice.title')}
      />

      <CatalogFeaturedSlotForm />
    </div>
  );
}
