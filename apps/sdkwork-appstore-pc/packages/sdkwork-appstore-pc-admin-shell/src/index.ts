/**
 * `@sdkwork/appstore-pc-admin-shell` — operator console shell for the App Store
 * `backend-admin` surface.
 *
 * Owns the `/admin` chrome and route tree, the shared operator UI kit, and
 * admin locale-fragment registration. Capability packages and the host compose
 * the console through this root export only — one import surface per package,
 * matching `COMPONENT_SPEC.md` `publicExports: ["."]`. `src/` internals are
 * private.
 *
 * Canonical specs: `APP_PC_ARCHITECTURE_SPEC.md`, `BACKEND_UI_SPEC.md`,
 * `I18N_SPEC.md`.
 */
export { AppstoreAdminShell, type AppstoreAdminShellProps } from './AppstoreAdminShell';

// Shared operator UI kit. Re-exported from the root so a capability package has a
// single import surface; `./ui` remains the UI-only entry point.
export * from './ui/index';

export {
  AdminBreadcrumb,
  type AdminBreadcrumbItem,
  type AdminBreadcrumbProps,
} from './components/AdminBreadcrumb';
export { AdminTopbar, type AdminTopbarProps } from './components/AdminTopbar';
export { AdminSidebar, type AdminSidebarProps } from './components/AdminSidebar';
export {
  AdminNavIcon,
  listAdminNavIconNames,
  type AdminNavIconProps,
} from './components/AdminNavIcon';
export { AdminAccessDenied, type AdminAccessDeniedProps } from './components/AdminAccessDenied';
export { AdminPageDenied, type AdminPageDeniedProps } from './components/AdminPageDenied';
export { AdminNotFound, type AdminNotFoundProps } from './components/AdminNotFound';

export {
  AdminRouteTree,
  resolveAdminAbsolutePath,
  type AdminRouteTreeProps,
} from './routes/index';

export {
  AppstoreAdminShellProvider,
  useAppstoreAdminPermission,
  useAppstoreAdminShell,
  type AppstoreAdminShellContextValue,
  type AppstoreAdminShellProviderProps,
} from './context/AdminShellContext';

export {
  useAdminCommand,
  type AppstoreAdminCommandState,
} from './hooks/useAdminCommand';

export {
  APPSTORE_ADMIN_SHELL_I18N_NAMESPACE,
  adminShellEnUS,
  adminShellZhCN,
  appstoreAdminShellI18nBundle,
  registerAppstoreAdminI18nBundles,
  type AppstoreAdminI18nBundle,
  type AppstoreAdminI18nInstance,
} from './i18n/index';
