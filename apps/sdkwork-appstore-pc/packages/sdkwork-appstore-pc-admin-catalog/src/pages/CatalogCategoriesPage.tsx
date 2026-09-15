import { useTranslation } from 'react-i18next';
import { AdminPageHeader } from '@sdkwork/appstore-pc-admin-shell';

import { CatalogCategoryCreateForm } from '../components/CatalogCategoryCreateForm';
import { CatalogCategoryUpdateForm } from '../components/CatalogCategoryUpdateForm';
import { CatalogReadGapNotice } from '../components/CatalogReadGapNotice';

/**
 * `catalog-categories` — category authoring console.
 *
 * The operator contract exposes category writes only, so the page is driven by
 * operator-supplied category ids and states that limitation up front instead of
 * pretending to own a category browser.
 */
export function CatalogCategoriesPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminCatalog.categories.description')}
        title={t('adminCatalog.categories.title')}
      />

      <CatalogReadGapNotice
        description={t('adminCatalog.categories.readGapNotice.description')}
        title={t('adminCatalog.categories.readGapNotice.title')}
      />

      <CatalogCategoryCreateForm />
      <CatalogCategoryUpdateForm />
    </div>
  );
}
