/**
 * Backend-admin SDK boundary.
 *
 * `createAppstorePcAdminBackendClient` is the single legal construction point
 * for this application's own backend SDK, and
 * `createAppstorePcAdminCompanyBackendClient` is the same boundary for the
 * `sdkwork-company` backend API (demand data). The application bootstrap imports
 * these factories instead of either generated SDK
 * (`BACKEND_UI_SPEC.md` §6, `APP_PC_ARCHITECTURE_SPEC.md` §7).
 */
export { createAppstorePcAdminBackendClient } from './backendClient';
export { createAppstorePcAdminCompanyBackendClient } from './companyBackendClient';
