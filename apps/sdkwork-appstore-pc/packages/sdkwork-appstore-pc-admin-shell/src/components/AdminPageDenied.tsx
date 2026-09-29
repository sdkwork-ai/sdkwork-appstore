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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-store-line-strong px-6 py-16 text-center ">
      <span className="text-store-ink-faint ">
        <Ban className="h-6 w-6" />
      </span>
      <h2 className="mt-2 text-sm font-semibold text-store-ink ">
        {t('adminShell.pageDenied.title')}
      </h2>
      <p className="mt-1 max-w-md text-xs leading-5 text-store-ink-faint ">
        {t('adminShell.pageDenied.description')}
      </p>
      {requiredPermissions.length > 0 ? (
        <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
          {requiredPermissions.map((code) => (
            <li
              key={code}
              className="rounded-full bg-store-subtle px-2.5 py-0.5 font-mono text-xs text-store-ink-soft font-medium"
            >
              {code}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
