import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_CATALOG_OPERATIONS,
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
 * Creates a category (`appstore.catalog.categories.create`).
 *
 * The operation returns only the new resource id, so the console remembers it
 * in component state; there is no category read port to re-fetch a record from.
 */
export function CatalogCategoryCreateForm() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [categoryCode, setCategoryCode] = useState('');
  const [parentCategoryId, setParentCategoryId] = useState('');
  const [validationError, setValidationError] = useState('');
  const [createdId, setCreatedId] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_CATALOG_OPERATIONS.createCategory);

  const handleSubmit = async () => {
    if (!categoryCode.trim()) {
      setValidationError(t('adminCatalog.categories.create.validationCategoryCodeRequired'));
      return;
    }
    setValidationError('');
    let newCategoryId = '';
    const succeeded = await command.run(async () => {
      newCategoryId = await services.catalog.createCategory({
        categoryCode: categoryCode.trim(),
        ...(parentCategoryId.trim() ? { parentCategoryId: parentCategoryId.trim() } : {}),
      });
    });
    if (succeeded) {
      setCreatedId(newCategoryId);
    }
  };

  return (
    <AdminSection
      description={t('adminCatalog.categories.create.description')}
      title={t('adminCatalog.categories.create.title')}
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        {command.succeeded ? (
          <>
            <CatalogFormNotice
              message={t('adminCatalog.categories.create.success')}
              tone="success"
            />
            <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
              {createdId
                ? t('adminCatalog.createResult.id', { id: createdId })
                : t('adminCatalog.createResult.idUnavailable')}
            </p>
          </>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminFormField
            error={validationError || undefined}
            hint={t('adminCatalog.categories.create.categoryCodeHint')}
            htmlFor="catalog-category-create-code"
            label={t('adminCatalog.categories.create.categoryCode')}
            required
          >
            <input
              id="catalog-category-create-code"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminCatalog.categories.create.categoryCodePlaceholder')}
              value={categoryCode}
              onChange={(event) => setCategoryCode(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="catalog-category-create-parent"
            label={t('adminCatalog.categories.create.parentCategoryId')}
          >
            <input
              id="catalog-category-create-parent"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminCatalog.categories.create.parentCategoryIdPlaceholder')}
              value={parentCategoryId}
              onChange={(event) => setParentCategoryId(event.target.value)}
            />
          </AdminFormField>
        </div>

        <div className="flex justify-end">
          <AdminActionButton
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminCatalog.categories.create.submitting')
              : t('adminCatalog.categories.create.submit')}
          </AdminActionButton>
        </div>
      </div>
    </AdminSection>
  );
}
