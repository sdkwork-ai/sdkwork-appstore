import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import {
  APPSTORE_ADMIN_CATALOG_OPERATIONS,
  useAppstoreAdminServices,
  type AppstoreAdminCollectionItemInput,
} from '@sdkwork/appstore-pc-admin-core';
import {
  ADMIN_INPUT_CLASS,
  AdminActionButton,
  AdminCommandError,
  AdminDataTable,
  AdminFormField,
  AdminSection,
  AdminStatePlaceholder,
  type AdminTableColumn,
  useAdminCommand,
} from '@sdkwork/appstore-pc-admin-shell';

import { CatalogFormNotice } from './CatalogFormNotice';

/** One unsaved collection item row held in page state until the operator submits. */
interface CollectionItemRow {
  /** Client-side row key; a wire item carries no identity of its own. */
  rowId: number;
  listingId: string;
  sortOrder: string;
}

/**
 * Replaces the item list of a collection
 * (`appstore.catalog.collections.items.update`).
 *
 * The operation is a whole-list replacement and rejects an empty list, so rows
 * are staged locally, submitted only once at least one row exists, and the
 * collection id is operator-supplied because no collection read endpoint
 * exists to load the current items from.
 */
export function CatalogCollectionItemsEditor() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [collectionId, setCollectionId] = useState('');
  const [rows, setRows] = useState<readonly CollectionItemRow[]>([]);
  const [nextRowId, setNextRowId] = useState(1);
  const [validationError, setValidationError] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_CATALOG_OPERATIONS.updateCollectionItems);

  const updateRow = (rowId: number, patch: Partial<CollectionItemRow>) => {
    setRows((previous) =>
      previous.map((row) => (row.rowId === rowId ? { ...row, ...patch } : row)),
    );
  };

  const handleAddRow = () => {
    setRows((previous) => [...previous, { rowId: nextRowId, listingId: '', sortOrder: '' }]);
    setNextRowId(nextRowId + 1);
  };

  const handleRemoveRow = (rowId: number) => {
    setRows((previous) => previous.filter((row) => row.rowId !== rowId));
  };

  const handleSubmit = async () => {
    if (!collectionId.trim()) {
      setValidationError(t('adminCatalog.collections.items.validationCollectionIdRequired'));
      return;
    }
    if (rows.some((row) => !row.listingId.trim())) {
      setValidationError(t('adminCatalog.collections.items.validationListingIdRequired'));
      return;
    }
    const items: AppstoreAdminCollectionItemInput[] = [];
    for (const row of rows) {
      const trimmedSortOrder = row.sortOrder.trim();
      const parsedSortOrder = trimmedSortOrder === '' ? undefined : Number(trimmedSortOrder);
      if (parsedSortOrder !== undefined && !Number.isInteger(parsedSortOrder)) {
        setValidationError(t('adminCatalog.collections.items.validationSortOrderInvalid'));
        return;
      }
      items.push({
        listingId: row.listingId.trim(),
        ...(parsedSortOrder === undefined ? {} : { sortOrder: parsedSortOrder }),
      });
    }
    setValidationError('');
    await command.run(() =>
      services.catalog.updateCollectionItems(collectionId.trim(), items),
    );
  };

  const columns: AdminTableColumn<CollectionItemRow>[] = [
    {
      key: 'listingId',
      header: t('adminCatalog.collections.items.columns.listingId'),
      render: (row) => (
        <input
          aria-label={t('adminCatalog.collections.items.columns.listingId')}
          className={ADMIN_INPUT_CLASS}
          value={row.listingId}
          onChange={(event) => updateRow(row.rowId, { listingId: event.target.value })}
        />
      ),
    },
    {
      key: 'sortOrder',
      header: t('adminCatalog.collections.items.columns.sortOrder'),
      width: 'w-32',
      render: (row) => (
        <input
          aria-label={t('adminCatalog.collections.items.columns.sortOrder')}
          className={ADMIN_INPUT_CLASS}
          inputMode="numeric"
          value={row.sortOrder}
          onChange={(event) => updateRow(row.rowId, { sortOrder: event.target.value })}
        />
      ),
    },
    {
      key: 'actions',
      header: t('adminCatalog.collections.items.columns.actions'),
      width: 'w-28',
      align: 'right',
      render: (row) => (
        <AdminActionButton onClick={() => handleRemoveRow(row.rowId)} variant="danger">
          <Trash2 className="h-3.5 w-3.5" />
          {t('adminCatalog.collections.items.removeRow')}
        </AdminActionButton>
      ),
    },
  ];

  return (
    <AdminSection
      actions={
        <AdminActionButton onClick={handleAddRow}>
          <Plus className="h-3.5 w-3.5" />
          {t('adminCatalog.collections.items.addRow')}
        </AdminActionButton>
      }
      description={t('adminCatalog.collections.items.description')}
      title={t('adminCatalog.collections.items.title')}
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        {command.succeeded ? (
          <CatalogFormNotice message={t('adminCatalog.collections.items.success')} tone="success" />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminFormField
            htmlFor="catalog-collection-items-id"
            label={t('adminCatalog.collections.items.collectionId')}
            required
          >
            <input
              id="catalog-collection-items-id"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminCatalog.collections.items.collectionIdPlaceholder')}
              value={collectionId}
              onChange={(event) => setCollectionId(event.target.value)}
            />
          </AdminFormField>
        </div>

        <AdminDataTable
          caption={t('adminCatalog.collections.items.title')}
          columns={columns}
          dense
          emptyContent={
            <AdminStatePlaceholder
              inline
              kind="empty"
              description={t('adminCatalog.collections.items.empty')}
            />
          }
          rowKey={(row) => String(row.rowId)}
          rows={rows}
        />

        {validationError ? <CatalogFormNotice message={validationError} tone="error" /> : null}

        <div className="flex flex-wrap items-center justify-end gap-3">
          {rows.length === 0 ? (
            <p className="text-[11px] text-gray-400 dark:text-gray-500">
              {t('adminCatalog.collections.items.emptySubmitHint')}
            </p>
          ) : null}
          <AdminActionButton
            disabled={rows.length === 0}
            loading={command.submitting}
            onClick={handleSubmit}
            variant="primary"
          >
            {command.submitting
              ? t('adminCatalog.collections.items.submitting')
              : t('adminCatalog.collections.items.submit')}
          </AdminActionButton>
        </div>
      </div>
    </AdminSection>
  );
}
