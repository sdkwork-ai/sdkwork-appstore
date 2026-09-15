/**
 * Backend-admin SDK boundary.
 *
 * `createAppstorePcAdminBackendClient` is the single legal construction point
 * for the generated backend SDK in this application; the application bootstrap
 * imports this factory instead of `@sdkwork/appstore-backend-sdk`
 * (`BACKEND_UI_SPEC.md` §6, `APP_PC_ARCHITECTURE_SPEC.md` §7).
 */
export { createAppstorePcAdminBackendClient } from './backendClient';
