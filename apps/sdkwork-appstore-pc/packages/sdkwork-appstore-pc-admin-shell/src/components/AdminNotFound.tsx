import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export interface AdminNotFoundProps {
  /** Console landing path offered by the recovery link. */
  homePath: string;
}

/** Fallback rendered for an unknown path under the console prefix. */
export function AdminNotFound({ homePath }: AdminNotFoundProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-store-line-strong px-6 py-16 text-center ">
      <span className="text-store-ink-faint ">
        <Compass className="h-6 w-6" />
      </span>
      <h2 className="mt-2 text-sm font-semibold text-store-ink ">
        {t('adminShell.notFound.title')}
      </h2>
      <p className="mt-1 max-w-md text-xs leading-5 text-store-ink-faint ">
        {t('adminShell.notFound.description')}
      </p>
      <Link
        to={homePath}
        className="mt-4 rounded-lg border border-store-line-strong px-3 py-1.5 text-xs font-medium text-store-ink-soft transition-colors hover:bg-store-subtle   "
      >
        {t('adminShell.notFound.back')}
      </Link>
    </div>
  );
}
