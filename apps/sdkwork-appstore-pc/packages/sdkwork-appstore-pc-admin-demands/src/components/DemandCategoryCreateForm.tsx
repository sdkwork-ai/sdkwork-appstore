import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_DEMAND_APP_FORMS,
  APPSTORE_ADMIN_DEMANDS_OPERATIONS,
  useAppstoreAdminServices,
  type AppstoreAdminDemandCategoryRow,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminFormField,
  AdminSection,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

import { flattenDemandCategories } from '../categoryTree';
import { parseDemandAppForm } from '../forms';
import { DemandFormNotice } from './DemandFormNotice';

interface DemandCategoryCreateFormProps {
  /** Current category rows, used for the parent selector. */
  rows: readonly AppstoreAdminDemandCategoryRow[];
  /** Called after a successful create so the page can reload the tree. */
  onCreated: () => void;
}

/**
 * Creates one demand category node through the demand service port.
 *
 * The service returns the created row, so the page reloads the tree instead of
 * patching local state; the created node appears in the publish cascading menu
 * on the next demand-hall load.
 */
export function DemandCategoryCreateForm({ rows, onCreated }: DemandCategoryCreateFormProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [categoryCode, setCategoryCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [displayNameEn, setDisplayNameEn] = useState('');
  const [parentId, setParentId] = useState('');
  const [appForm, setAppForm] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [validationError, setValidationError] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_DEMANDS_OPERATIONS.createCategory);
  const parents = flattenDemandCategories(rows);

  const handleSubmit = async () => {
    if (!categoryCode.trim()) {
      setValidationError(t('adminDemands.categories.create.validationCategoryCodeRequired'));
      return;
    }
    if (!displayName.trim()) {
      setValidationError(t('adminDemands.categories.create.validationDisplayNameRequired'));
      return;
    }
    const rawSortOrder = sortOrder.trim();
    if (rawSortOrder !== '' && !/^-?\d+$/u.test(rawSortOrder)) {
      setValidationError(t('adminDemands.categories.create.validationSortOrderInvalid'));
      return;
    }
    const parsedSortOrder = rawSortOrder === '' ? undefined : Number.parseInt(rawSortOrder, 10);
    setValidationError('');
    const parsedAppForm = parseDemandAppForm(appForm);
    const succeeded = await command.run(async () => {
      await services.demands.createCategory({
        categoryCode: categoryCode.trim(),
        displayName: displayName.trim(),
        ...(displayNameEn.trim() ? { displayNameEn: displayNameEn.trim() } : {}),
        ...(parentId ? { parentId } : {}),
        ...(parsedAppForm === undefined ? {} : { appForm: parsedAppForm }),
        ...(parsedSortOrder === undefined ? {} : { sortOrder: parsedSortOrder }),
      });
    });
    if (succeeded) {
      setCategoryCode('');
      setDisplayName('');
      setDisplayNameEn('');
      setParentId('');
      setAppForm('');
      setSortOrder('');
      onCreated();
    }
  };

  return (
    <AdminSection
      description={t('adminDemands.categories.create.description')}
      title={t('adminDemands.categories.create.title')}
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        {command.succeeded ? (
          <DemandFormNotice message={t('adminDemands.categories.create.success')} tone="success" />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminFormField
            error={validationError || undefined}
            hint={t('adminDemands.categories.create.categoryCodeHint')}
            htmlFor="demand-category-create-code"
            label={t('adminDemands.categories.create.categoryCode')}
            required
          >
            <input
              id="demand-category-create-code"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminDemands.categories.create.categoryCodePlaceholder')}
              value={categoryCode}
              onChange={(event) => setCategoryCode(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="demand-category-create-name"
            label={t('adminDemands.categories.create.displayName')}
            required
          >
            <input
              id="demand-category-create-name"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminDemands.categories.create.displayNamePlaceholder')}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="demand-category-create-name-en"
            label={t('adminDemands.categories.create.displayNameEn')}
          >
            <input
              id="demand-category-create-name-en"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminDemands.categories.create.displayNameEnPlaceholder')}
              value={displayNameEn}
              onChange={(event) => setDisplayNameEn(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="demand-category-create-parent"
            label={t('adminDemands.categories.create.parentId')}
          >
            <select
              id="demand-category-create-parent"
              className={ADMIN_INPUT_CLASS}
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
            >
              <option value="">{t('adminDemands.categories.create.parentRoot')}</option>
              {parents.map((entry) => (
                <option key={entry.row.categoryId} value={entry.row.categoryId}>
                  {`${'— '.repeat(entry.depth)}${entry.row.displayName}`}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField
            hint={t('adminDemands.categories.create.appFormHint')}
            htmlFor="demand-category-create-app-form"
            label={t('adminDemands.categories.create.appForm')}
          >
            <select
              id="demand-category-create-app-form"
              className={ADMIN_INPUT_CLASS}
              value={appForm}
              onChange={(event) => setAppForm(event.target.value)}
            >
              <option value="">{t('adminDemands.categories.create.appFormUnspecified')}</option>
              {APPSTORE_ADMIN_DEMAND_APP_FORMS.map((form) => (
                <option key={form} value={form}>
                  {t(`adminDemands.appForms.${form}`)}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField
            hint={t('adminDemands.categories.create.sortOrderHint')}
            htmlFor="demand-category-create-sort"
            label={t('adminDemands.categories.create.sortOrder')}
          >
            <input
              id="demand-category-create-sort"
              className={ADMIN_INPUT_CLASS}
              inputMode="numeric"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </AdminFormField>
        </div>

        <div className="flex justify-end">
          <AdminActionButton loading={command.submitting} onClick={handleSubmit} variant="primary">
            {command.submitting
              ? t('adminDemands.categories.create.submitting')
              : t('adminDemands.categories.create.submit')}
          </AdminActionButton>
        </div>
      </div>
    </AdminSection>
  );
}
