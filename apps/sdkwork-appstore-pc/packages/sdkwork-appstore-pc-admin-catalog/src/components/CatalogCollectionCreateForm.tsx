import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_CATALOG_OPERATIONS,
  APPSTORE_ADMIN_COLLECTION_AUDIENCE_SCOPES,
  APPSTORE_ADMIN_COLLECTION_TYPES,
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
 * Creates a collection (`appstore.catalog.collections.create`).
 *
 * The operation returns only the new resource id, so the console remembers it in
 * component state; the audience scope is optional and omitted when the operator
 * leaves the backend default in place.
 */
export function CatalogCollectionCreateForm() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [collectionCode, setCollectionCode] = useState('');
  const [collectionType, setCollectionType] = useState<string>(
    APPSTORE_ADMIN_COLLECTION_TYPES[0],
  );
  const [audienceScope, setAudienceScope] = useState('');
  const [validationError, setValidationError] = useState('');
  const [createdId, setCreatedId] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_CATALOG_OPERATIONS.createCollection);

  const handleSubmit = async () => {
    if (!collectionCode.trim()) {
      setValidationError(t('adminCatalog.collections.create.validationCollectionCodeRequired'));
      return;
    }
    setValidationError('');
    let newCollectionId = '';
    const succeeded = await command.run(async () => {
      newCollectionId = await services.catalog.createCollection({
        collectionCode: collectionCode.trim(),
        collectionType,
        ...(audienceScope ? { audienceScope } : {}),
      });
    });
    if (succeeded) {
      setCreatedId(newCollectionId);
    }
  };

  return (
    <AdminSection
      description={t('adminCatalog.collections.create.description')}
      title={t('adminCatalog.collections.create.title')}
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        {command.succeeded ? (
          <>
            <CatalogFormNotice
              message={t('adminCatalog.collections.create.success')}
              tone="success"
            />
            <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400">
              {createdId
                ? t('adminCatalog.createResult.id', { id: createdId })
                : t('adminCatalog.createResult.idUnavailable')}
            </p>
          </>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminFormField
            error={validationError || undefined}
            hint={t('adminCatalog.collections.create.collectionCodeHint')}
            htmlFor="catalog-collection-create-code"
            label={t('adminCatalog.collections.create.collectionCode')}
            required
          >
            <input
              id="catalog-collection-create-code"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminCatalog.collections.create.collectionCodePlaceholder')}
              value={collectionCode}
              onChange={(event) => setCollectionCode(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="catalog-collection-create-type"
            label={t('adminCatalog.collections.create.collectionType')}
            required
          >
            <select
              id="catalog-collection-create-type"
              className={ADMIN_INPUT_CLASS}
              value={collectionType}
              onChange={(event) => setCollectionType(event.target.value)}
            >
              {APPSTORE_ADMIN_COLLECTION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`adminCatalog.collectionType.${type}`)}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField
            htmlFor="catalog-collection-create-audience"
            label={t('adminCatalog.collections.create.audienceScope')}
          >
            <select
              id="catalog-collection-create-audience"
              className={ADMIN_INPUT_CLASS}
              value={audienceScope}
              onChange={(event) => setAudienceScope(event.target.value)}
            >
              <option value="">{t('adminCatalog.collections.create.audienceScopeUnspecified')}</option>
              {APPSTORE_ADMIN_COLLECTION_AUDIENCE_SCOPES.map((scope) => (
                <option key={scope} value={scope}>
                  {t(`adminCatalog.audienceScope.${scope}`)}
                </option>
              ))}
            </select>
          </AdminFormField>
        </div>

        <div className="flex justify-end">
          <AdminActionButton
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminCatalog.collections.create.submitting')
              : t('adminCatalog.collections.create.submit')}
          </AdminActionButton>
        </div>
      </div>
    </AdminSection>
  );
}
