import { useTranslation } from 'react-i18next';
import { ShieldAlert } from 'lucide-react';
import { APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS } from '@sdkwork/appstore-pc-admin-core';

export interface AdminAccessDeniedProps {
  /** Permission codes that would grant entry; defaults to the surface entry set. */
  requiredPermissions?: readonly string[];
  /** Title override used by page-level denial. */
  titleKey?: string;
  /** Description override used by page-level denial. */
  descriptionKey?: string;
}

/**
 * Fail-closed operator console denial screen.
 *
 * Rendered before any capability page mounts, so an unauthorized operator never
 * triggers a backend call. The permission codes are shown as machine state —
 * they are localization keys, not copy (`I18N_SPEC.md` §5).
 */
export function AdminAccessDenied({
  descriptionKey = 'adminShell.accessDenied.description',
  requiredPermissions = APPSTORE_ADMIN_SURFACE_ENTRY_PERMISSIONS,
  titleKey = 'adminShell.accessDenied.title',
}: AdminAccessDeniedProps) {
  const { t } = useTranslation();
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
        <ShieldAlert className="h-6 w-6" />
      </span>
      <h1 className="mt-4 text-xl font-semibold text-gray-900 dark:text-gray-50">{t(titleKey)}</h1>
      <p className="mt-2 max-w-lg text-sm leading-6 text-gray-600 dark:text-gray-400">
        {t(descriptionKey)}
      </p>
      {requiredPermissions.length > 0 ? (
        <div className="mt-5 max-w-xl">
          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {t('adminShell.accessDenied.requiredPermission')}
          </p>
          <ul className="mt-2 flex flex-wrap justify-center gap-1.5">
            {requiredPermissions.map((code) => (
              <li
                key={code}
                className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600 dark:bg-[#20232c] dark:text-gray-300"
              >
                {code}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
