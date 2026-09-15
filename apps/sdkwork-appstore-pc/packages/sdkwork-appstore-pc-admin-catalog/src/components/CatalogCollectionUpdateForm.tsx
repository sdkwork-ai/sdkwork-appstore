import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_CATALOG_OPERATIONS,
  APPSTORE_ADMIN_CATALOG_STATUSES,
  useAppstoreAdminServices,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminFormField,
  AdminSection,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

import { CatalogFormNotice } from './CatalogFormNotice';

/**
 * Updates a collection (`appstore.catalog.collections.update`).
 *
 * The collection id is operator-supplied because the operator contract has no
 * collection read endpoint; an empty status or sort order is omitted so a
 * targeted edit never overwrites the other field.
 */
export function CatalogCollectionUpdateForm() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [collectionId, setCollectionId] = useState('');
  const [collectionStatus, setCollectionStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [validationError, setValidationError] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_CATALOG_OPERATIONS.updateCollection);

  const handleSubmit = async () => {
    if (!collectionId.trim()) {
      setValidationError(t('adminCatalog.collections.update.validationCollectionIdRequired'));
      return;
    }
    const trimmedSortOrder = sortOrder.trim();
    const parsedSortOrder = trimmedSortOrder === '' ? undefined : Number(trimmedSortOrder);
    if (parsedSortOrder !== undefined && !Number.isInteger(parsedSortOrder)) {
      setValidationError(t('adminCatalog.collections.update.validationSortOrderInvalid'));
      return;
    }
    setValidationError('');
    await command.run(() =>
      services.catalog.updateCollection(collectionId.trim(), {
        ...(collectionStatus ? { collectionStatus } : {}),
        ...(parsedSortOrder === undefined ? {} : { sortOrder: parsedSortOrder }),
      }),
    );
  };

  return (
    <AdminSection
      description={t('adminCatalog.collections.update.description')}
      title={t('adminCatalog.collections.update.title')}
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        {command.succeeded ? (
          <CatalogFormNotice
            message={t('adminCatalog.collections.update.success')}
            tone="success"
          />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminFormField
            htmlFor="catalog-collection-update-id"
            label={t('adminCatalog.collections.update.collectionId')}
            required
          >
            <input
              id="catalog-collection-update-id"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminCatalog.collections.update.collectionIdPlaceholder')}
              value={collectionId}
              onChange={(event) => setCollectionId(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="catalog-collection-update-status"
            label={t('adminCatalog.collections.update.collectionStatus')}
          >
            <select
              id="catalog-collection-update-status"
              className={ADMIN_INPUT_CLASS}
              value={collectionStatus}
              onChange={(event) => setCollectionStatus(event.target.value)}
            >
              <option value="">
                {t('adminCatalog.collections.update.collectionStatusUnchanged')}
              </option>
              {APPSTORE_ADMIN_CATALOG_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`adminCatalog.status.${status}`)}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField
            hint={t('adminCatalog.collections.update.sortOrderHint')}
            htmlFor="catalog-collection-update-sort-order"
            label={t('adminCatalog.collections.update.sortOrder')}
          >
            <input
              id="catalog-collection-update-sort-order"
              className={ADMIN_INPUT_CLASS}
              inputMode="numeric"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </AdminFormField>
        </div>

        {validationError ? <CatalogFormNotice message={validationError} tone="error" /> : null}

        <div className="flex justify-end">
          <AdminActionButton
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminCatalog.collections.update.submitting')
              : t('adminCatalog.collections.update.submit')}
          </AdminActionButton>
        </div>
      </div>
    </AdminSection>
  );
}
