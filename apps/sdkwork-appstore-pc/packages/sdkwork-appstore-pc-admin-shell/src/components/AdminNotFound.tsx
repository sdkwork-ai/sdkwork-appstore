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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-6 py-16 text-center dark:border-[#2a2e3a]">
      <span className="text-gray-400 dark:text-gray-500">
        <Compass className="h-6 w-6" />
      </span>
      <h2 className="mt-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
        {t('adminShell.notFound.title')}
      </h2>
      <p className="mt-1 max-w-md text-xs leading-5 text-gray-500 dark:text-gray-400">
        {t('adminShell.notFound.description')}
      </p>
      <Link
        to={homePath}
        className="mt-4 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-[#2f3442] dark:text-gray-200 dark:hover:bg-[#1d2028]"
      >
        {t('adminShell.notFound.back')}
      </Link>
    </div>
  );
}
