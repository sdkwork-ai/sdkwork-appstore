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
 * Updates a category (`appstore.catalog.categories.update`).
 *
 * The category id is operator-supplied: the operator console has no category
 * read port to pick an id from, and an empty status or sort order is omitted so
 * a targeted edit never overwrites the other field.
 */
export function CatalogCategoryUpdateForm() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [categoryId, setCategoryId] = useState('');
  const [categoryStatus, setCategoryStatus] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [validationError, setValidationError] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_CATALOG_OPERATIONS.updateCategory);

  const handleSubmit = async () => {
    if (!categoryId.trim()) {
      setValidationError(t('adminCatalog.categories.update.validationCategoryIdRequired'));
      return;
    }
    const trimmedSortOrder = sortOrder.trim();
    const parsedSortOrder = trimmedSortOrder === '' ? undefined : Number(trimmedSortOrder);
    if (parsedSortOrder !== undefined && !Number.isInteger(parsedSortOrder)) {
      setValidationError(t('adminCatalog.categories.update.validationSortOrderInvalid'));
      return;
    }
    setValidationError('');
    await command.run(() =>
      services.catalog.updateCategory(categoryId.trim(), {
        ...(categoryStatus ? { categoryStatus } : {}),
        ...(parsedSortOrder === undefined ? {} : { sortOrder: parsedSortOrder }),
      }),
    );
  };

  return (
    <AdminSection
      description={t('adminCatalog.categories.update.description')}
      title={t('adminCatalog.categories.update.title')}
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        {command.succeeded ? (
          <CatalogFormNotice message={t('adminCatalog.categories.update.success')} tone="success" />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminFormField
            htmlFor="catalog-category-update-id"
            label={t('adminCatalog.categories.update.categoryId')}
            required
          >
            <input
              id="catalog-category-update-id"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminCatalog.categories.update.categoryIdPlaceholder')}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="catalog-category-update-status"
            label={t('adminCatalog.categories.update.categoryStatus')}
          >
            <select
              id="catalog-category-update-status"
              className={ADMIN_INPUT_CLASS}
              value={categoryStatus}
              onChange={(event) => setCategoryStatus(event.target.value)}
            >
              <option value="">{t('adminCatalog.categories.update.categoryStatusUnchanged')}</option>
              {APPSTORE_ADMIN_CATALOG_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`adminCatalog.status.${status}`)}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField
            hint={t('adminCatalog.categories.update.sortOrderHint')}
            htmlFor="catalog-category-update-sort-order"
            label={t('adminCatalog.categories.update.sortOrder')}
          >
            <input
              id="catalog-category-update-sort-order"
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
              ? t('adminCatalog.categories.update.submitting')
              : t('adminCatalog.categories.update.submit')}
          </AdminActionButton>
        </div>
      </div>
    </AdminSection>
  );
}
