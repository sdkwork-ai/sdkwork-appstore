import { useTranslation } from 'react-i18next';
import { Ban } from 'lucide-react';

export interface AdminPageDeniedProps {
  /** Permission codes the route requires. */
  requiredPermissions?: readonly string[];
}

/**
 * In-shell page-level denial rendered by the route guard when the operator can
 * enter the console but lacks the page's permission.
 */
export function AdminPageDenied({ requiredPermissions = [] }: AdminPageDeniedProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-[#2a2e3a]">
      <span className="text-gray-400 dark:text-gray-500">
        <Ban className="h-6 w-6" />
      </span>
      <h2 className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
        {t('adminShell.pageDenied.title')}
      </h2>
      <p className="mt-1 max-w-md text-xs leading-5 text-gray-500 dark:text-gray-400">
        {t('adminShell.pageDenied.description')}
      </p>
      {requiredPermissions.length > 0 ? (
        <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
          {requiredPermissions.map((code) => (
            <li
              key={code}
              className="rounded-md bg-gray-100 px-2 py-0.5 font-mono text-[11px] text-gray-600 dark:bg-[#20232c] dark:text-gray-300"
            >
              {code}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
