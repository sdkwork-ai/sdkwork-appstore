import {
  APPSTORE_ADMIN_DEMAND_APP_FORMS,
  APPSTORE_ADMIN_DEMAND_CATEGORY_STATUSES,
  type AppstoreAdminDemandAppForm,
  type AppstoreAdminDemandCategoryStatus,
} from '@sdkwork/appstore-pc-admin-core';

/**
 * Narrow a `<select>` value to a known application form.
 * @param value - raw select value; empty means "not specified".
 * @returns the form code, or undefined when the select is empty.
 */
export function parseDemandAppForm(value: string): AppstoreAdminDemandAppForm | undefined {
  return (APPSTORE_ADMIN_DEMAND_APP_FORMS as readonly string[]).includes(value)
    ? (value as AppstoreAdminDemandAppForm)
    : undefined;
}

/**
 * Narrow a `<select>` value to a known category status.
 * @param value - raw select value; empty means "unchanged".
 * @returns the status code, or undefined when the select is empty.
 */
export function parseDemandCategoryStatus(
  value: string,
): AppstoreAdminDemandCategoryStatus | undefined {
  return (APPSTORE_ADMIN_DEMAND_CATEGORY_STATUSES as readonly string[]).includes(value)
    ? (value as AppstoreAdminDemandCategoryStatus)
    : undefined;
}
