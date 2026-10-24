import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_DEMAND_APP_FORMS,
  APPSTORE_ADMIN_DEMAND_CATEGORY_STATUSES,
  APPSTORE_ADMIN_DEMANDS_OPERATIONS,
  useAppstoreAdminServices,
  type AppstoreAdminDemandCategoryRow,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminDialog,
  AdminFormField,
  AdminSection,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

import { collectDemandCategorySubtree, flattenDemandCategories } from '../categoryTree';
import { parseDemandAppForm, parseDemandCategoryStatus } from '../forms';
import { DemandFormNotice } from './DemandFormNotice';

interface DemandCategoryUpdateFormProps {
  /** Current category rows. */
  rows: readonly AppstoreAdminDemandCategoryRow[];
  /** Category picked in the tree table; empty renders the pick hint only. */
  categoryId: string;
  /** Called after a successful update or delete so the page reloads the tree. */
  onChanged: () => void;
}

/**
 * Edits or deletes one demand category.
 *
 * The form is remounted per picked category (`key` at the call site), so its
 * fields initialize from the selected row without a sync effect. The parent
 * selector excludes the node's own subtree: re-parenting a category under one
 * of its descendants would create a cycle the service would have to reject.
 */
export function DemandCategoryUpdateForm({
  rows,
  categoryId,
  onChanged,
}: DemandCategoryUpdateFormProps) {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const selected = rows.find((row) => row.categoryId === categoryId);
  const [displayName, setDisplayName] = useState(selected?.displayName ?? '');
  const [displayNameEn, setDisplayNameEn] = useState(selected?.displayNameEn ?? '');
  const [parentId, setParentId] = useState(selected?.parentId ?? '');
  const [appForm, setAppForm] = useState(selected?.appForm ?? '');
  const [sortOrder, setSortOrder] = useState(
    selected?.sortOrder === undefined ? '' : String(selected.sortOrder),
  );
  const [status, setStatus] = useState('');
  const [validationError, setValidationError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState(false);
  const command = useAdminCommand(APPSTORE_ADMIN_DEMANDS_OPERATIONS.updateCategory);
  const removeCommand = useAdminCommand(APPSTORE_ADMIN_DEMANDS_OPERATIONS.deleteCategory);

  if (selected === undefined) {
    return (
      <AdminSection
        description={t('adminDemands.categories.update.description')}
        title={t('adminDemands.categories.update.title')}
      >
        <DemandFormNotice message={t('adminDemands.categories.update.pickHint')} tone="info" />
      </AdminSection>
    );
  }

  const excluded = collectDemandCategorySubtree(rows, selected.categoryId);
  const parentOptions = flattenDemandCategories(rows).filter(
    (entry) => !excluded.has(entry.row.categoryId),
  );

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      setValidationError(t('adminDemands.categories.update.validationDisplayNameRequired'));
      return;
    }
    const rawSortOrder = sortOrder.trim();
    if (rawSortOrder !== '' && !/^-?\d+$/u.test(rawSortOrder)) {
      setValidationError(t('adminDemands.categories.update.validationSortOrderInvalid'));
      return;
    }
    const parsedSortOrder = rawSortOrder === '' ? undefined : Number.parseInt(rawSortOrder, 10);
    setValidationError('');
    const parsedAppForm = parseDemandAppForm(appForm);
    const parsedStatus = parseDemandCategoryStatus(status);
    const succeeded = await command.run(async () => {
      await services.demands.updateCategory(selected.categoryId, {
        displayName: displayName.trim(),
        displayNameEn: displayNameEn.trim(),
        parentId,
        ...(parsedAppForm === undefined ? {} : { appForm: parsedAppForm }),
        ...(parsedSortOrder === undefined ? {} : { sortOrder: parsedSortOrder }),
        ...(parsedStatus === undefined ? {} : { status: parsedStatus }),
      });
    });
    if (succeeded) {
      onChanged();
    }
  };

  const handleRemove = async () => {
    setConfirmRemove(false);
    const succeeded = await removeCommand.run(async () => {
      await services.demands.deleteCategory(selected.categoryId);
    });
    if (succeeded) {
      onChanged();
    }
  };

  return (
    <AdminSection
      description={t('adminDemands.categories.update.description')}
      title={`${t('adminDemands.categories.update.title')} · ${selected.displayName}`}
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error ?? removeCommand.error} />
        {command.succeeded ? (
          <DemandFormNotice message={t('adminDemands.categories.update.success')} tone="success" />
        ) : null}
        {removeCommand.succeeded ? (
          <DemandFormNotice message={t('adminDemands.categories.update.removeSuccess')} tone="success" />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <AdminFormField
            htmlFor="demand-category-update-id"
            label={t('adminDemands.categories.update.categoryId')}
          >
            <input
              id="demand-category-update-id"
              className={`${ADMIN_INPUT_CLASS} font-mono`}
              readOnly
              value={selected.categoryId}
            />
          </AdminFormField>
          <AdminFormField
            error={validationError || undefined}
            htmlFor="demand-category-update-name"
            label={t('adminDemands.categories.update.displayName')}
            required
          >
            <input
              id="demand-category-update-name"
              className={ADMIN_INPUT_CLASS}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="demand-category-update-name-en"
            label={t('adminDemands.categories.update.displayNameEn')}
          >
            <input
              id="demand-category-update-name-en"
              className={ADMIN_INPUT_CLASS}
              value={displayNameEn}
              onChange={(event) => setDisplayNameEn(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="demand-category-update-parent"
            label={t('adminDemands.categories.update.parentId')}
          >
            <select
              id="demand-category-update-parent"
              className={ADMIN_INPUT_CLASS}
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
            >
              <option value="">{t('adminDemands.categories.update.parentRoot')}</option>
              {parentOptions.map((entry) => (
                <option key={entry.row.categoryId} value={entry.row.categoryId}>
                  {`${'— '.repeat(entry.depth)}${entry.row.displayName}`}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField
            htmlFor="demand-category-update-app-form"
            label={t('adminDemands.categories.update.appForm')}
          >
            <select
              id="demand-category-update-app-form"
              className={ADMIN_INPUT_CLASS}
              value={appForm}
              onChange={(event) => setAppForm(event.target.value)}
            >
              <option value="">{t('adminDemands.categories.update.appFormUnchanged')}</option>
              {APPSTORE_ADMIN_DEMAND_APP_FORMS.map((form) => (
                <option key={form} value={form}>
                  {t(`adminDemands.appForms.${form}`)}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField
            hint={t('adminDemands.categories.update.sortOrderHint')}
            htmlFor="demand-category-update-sort"
            label={t('adminDemands.categories.update.sortOrder')}
          >
            <input
              id="demand-category-update-sort"
              className={ADMIN_INPUT_CLASS}
              inputMode="numeric"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="demand-category-update-status"
            label={t('adminDemands.categories.update.status')}
          >
            <select
              id="demand-category-update-status"
              className={ADMIN_INPUT_CLASS}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="">{t('adminDemands.categories.update.statusUnchanged')}</option>
              {APPSTORE_ADMIN_DEMAND_CATEGORY_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {t(`adminDemands.status.${value}`)}
                </option>
              ))}
            </select>
          </AdminFormField>
        </div>

        <div className="flex justify-between">
          <AdminActionButton
            loading={removeCommand.submitting}
            onClick={() => setConfirmRemove(true)}
            variant="danger"
          >
            {removeCommand.submitting
              ? t('adminDemands.categories.update.removing')
              : t('adminDemands.categories.update.remove')}
          </AdminActionButton>
          <AdminActionButton loading={command.submitting} onClick={handleSubmit} variant="primary">
            {command.submitting
              ? t('adminDemands.categories.update.submitting')
              : t('adminDemands.categories.update.submit')}
          </AdminActionButton>
        </div>
      </div>

      <AdminDialog
        description={t('adminDemands.categories.update.removeConfirm')}
        footer={
          <>
            <AdminActionButton onClick={() => setConfirmRemove(false)}>
              {t('adminShell.common.cancel')}
            </AdminActionButton>
            <AdminActionButton
              loading={removeCommand.submitting}
              onClick={handleRemove}
              variant="danger"
            >
              {t('adminDemands.categories.update.remove')}
            </AdminActionButton>
          </>
        }
        onClose={() => setConfirmRemove(false)}
        open={confirmRemove}
        title={t('adminDemands.categories.update.remove')}
      >
        <p className="text-xs text-store-ink-soft ">
          {t('adminDemands.categories.update.removeTarget', { name: selected.displayName })}
        </p>
      </AdminDialog>
    </AdminSection>
  );
}
