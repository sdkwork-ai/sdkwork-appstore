import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  APPSTORE_ADMIN_CATALOG_OPERATIONS,
  APPSTORE_ADMIN_FEATURED_SLOT_STATUSES,
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
 * Schedules a featured slot (`appstore.catalog.featured.update`).
 *
 * The slot code is operator-supplied because the operator contract has no
 * featured-slot read endpoint, and the operation replaces the listing, window,
 * and status as a whole. `datetime-local` values are local time and are
 * converted to ISO 8601 UTC instants, which is the only form the port accepts.
 */
export function CatalogFeaturedSlotForm() {
  const { t } = useTranslation();
  const services = useAppstoreAdminServices();
  const [slotCode, setSlotCode] = useState('');
  const [listingId, setListingId] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [slotStatus, setSlotStatus] = useState('');
  const [validationError, setValidationError] = useState('');
  const command = useAdminCommand(APPSTORE_ADMIN_CATALOG_OPERATIONS.updateFeaturedSlot);

  const handleSubmit = async () => {
    if (!slotCode.trim()) {
      setValidationError(t('adminCatalog.featured.slot.validationSlotCodeRequired'));
      return;
    }
    if (!listingId.trim()) {
      setValidationError(t('adminCatalog.featured.slot.validationListingIdRequired'));
      return;
    }
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (!startsAt || !endsAt || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setValidationError(t('adminCatalog.featured.slot.validationScheduleRequired'));
      return;
    }
    if (end.getTime() <= start.getTime()) {
      setValidationError(t('adminCatalog.featured.slot.validationScheduleOrder'));
      return;
    }
    setValidationError('');
    await command.run(() =>
      services.catalog.updateFeaturedSlot(slotCode.trim(), {
        listingId: listingId.trim(),
        startsAt: start.toISOString(),
        endsAt: end.toISOString(),
        ...(slotStatus ? { slotStatus } : {}),
      }),
    );
  };

  return (
    <AdminSection
      description={t('adminCatalog.featured.slot.description')}
      title={t('adminCatalog.featured.slot.title')}
    >
      <div className="space-y-4">
        <AdminCommandError error={command.error} />
        {command.succeeded ? (
          <CatalogFormNotice message={t('adminCatalog.featured.slot.success')} tone="success" />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AdminFormField
            htmlFor="catalog-featured-slot-code"
            label={t('adminCatalog.featured.slot.slotCode')}
            required
          >
            <input
              id="catalog-featured-slot-code"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminCatalog.featured.slot.slotCodePlaceholder')}
              value={slotCode}
              onChange={(event) => setSlotCode(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="catalog-featured-slot-listing-id"
            label={t('adminCatalog.featured.slot.listingId')}
            required
          >
            <input
              id="catalog-featured-slot-listing-id"
              className={ADMIN_INPUT_CLASS}
              placeholder={t('adminCatalog.featured.slot.listingIdPlaceholder')}
              value={listingId}
              onChange={(event) => setListingId(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="catalog-featured-slot-status"
            label={t('adminCatalog.featured.slot.slotStatus')}
          >
            <select
              id="catalog-featured-slot-status"
              className={ADMIN_INPUT_CLASS}
              value={slotStatus}
              onChange={(event) => setSlotStatus(event.target.value)}
            >
              <option value="">{t('adminCatalog.featured.slot.slotStatusUnchanged')}</option>
              {APPSTORE_ADMIN_FEATURED_SLOT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`adminCatalog.featuredSlotStatus.${status}`)}
                </option>
              ))}
            </select>
          </AdminFormField>
          <AdminFormField
            hint={t('adminCatalog.featured.slot.timeHint')}
            htmlFor="catalog-featured-slot-starts-at"
            label={t('adminCatalog.featured.slot.startsAt')}
            required
          >
            <input
              id="catalog-featured-slot-starts-at"
              className={ADMIN_INPUT_CLASS}
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
            />
          </AdminFormField>
          <AdminFormField
            htmlFor="catalog-featured-slot-ends-at"
            label={t('adminCatalog.featured.slot.endsAt')}
            required
          >
            <input
              id="catalog-featured-slot-ends-at"
              className={ADMIN_INPUT_CLASS}
              type="datetime-local"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
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
              ? t('adminCatalog.featured.slot.submitting')
              : t('adminCatalog.featured.slot.submit')}
          </AdminActionButton>
        </div>
      </div>
    </AdminSection>
  );
}
