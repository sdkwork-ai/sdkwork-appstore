/**
 * `@sdkwork/appstore-pc-admin-core` — the App Store `backend-admin` runtime.
 *
 * Owns the operator console's backend boundary: the single legal construction
 * point for the generated backend SDK, the backend-admin permission catalog,
 * access evaluation, route/guard contracts, and one service port per backend
 * domain. Capability packages (`pc-admin-*`) and the shell consume this package
 * through the root export only (`COMPONENT_SPEC.md` `publicExports: ["."]`).
 *
 * Canonical specs: `APP_PC_ARCHITECTURE_SPEC.md`, `BACKEND_UI_SPEC.md`,
 * `APP_SDK_INTEGRATION_SPEC.md`.
 */
export * from './permissions';
export * from './access';
export * from './guards';
export * from './hooks';
export * from './services';
export * from './routes';
export * from './session';
export * from './modules';
export * from './host';
export * from './composition';
export * from './runtime';
export * from './i18n';

export { createAppstorePcAdminBackendClient } from './sdk';
