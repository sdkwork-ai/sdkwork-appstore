import { useTranslation } from 'react-i18next';
import { AdminPageHeader } from '@sdkwork/appstore-pc-admin-shell';

import { CatalogCollectionCreateForm } from '../components/CatalogCollectionCreateForm';
import { CatalogCollectionItemsEditor } from '../components/CatalogCollectionItemsEditor';
import { CatalogCollectionUpdateForm } from '../components/CatalogCollectionUpdateForm';
import { CatalogReadGapNotice } from '../components/CatalogReadGapNotice';

/**
 * `catalog-collections` — collection authoring console.
 *
 * The operator contract exposes collection writes only, so the page is driven by
 * operator-supplied collection ids and states that limitation up front instead
 * of pretending to own a collection browser.
 */
export function CatalogCollectionsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        description={t('adminCatalog.collections.description')}
        title={t('adminCatalog.collections.title')}
      />

      <CatalogReadGapNotice
        description={t('adminCatalog.collections.readGapNotice.description')}
        title={t('adminCatalog.collections.readGapNotice.title')}
      />

      <CatalogCollectionCreateForm />
      <CatalogCollectionUpdateForm />
      <CatalogCollectionItemsEditor />
    </div>
  );
}
