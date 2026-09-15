import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import type { AppstoreAdminServiceError } from '@sdkwork/appstore-pc-admin-core';

export interface AdminCommandErrorProps {
  /** Normalized failure from a read or write operation; renders nothing when absent. */
  error: AppstoreAdminServiceError | undefined;
}

/**
 * Compact inline alert for a normalized backend-admin failure.
 *
 * Presentation copy is chosen from the stable error `kind` (`I18N_SPEC.md` §7);
 * the raw transport message is never shown as user-facing copy, and the
 * machine-readable code, operation id, and trace id are listed separately for
 * support escalation.
 */
export function AdminCommandError({ error }: AdminCommandErrorProps) {
  const { t } = useTranslation();
  if (!error) {
    return null;
  }

  const title = (() => {
    switch (error.kind) {
      case 'unauthorized':
        return t('adminShell.state.unauthorized.title');
      case 'forbidden':
        return t('adminShell.state.forbidden.title');
      case 'notFound':
        return t('adminShell.state.notFound.title');
      case 'runtimeUnconfigured':
        return t('adminShell.state.runtimeUnconfigured.title');
      default:
        return t('adminShell.state.error.title');
    }
  })();

  const description = (() => {
    switch (error.kind) {
      case 'unauthorized':
        return t('adminShell.state.unauthorized.description');
      case 'forbidden':
        return t('adminShell.state.forbidden.description');
      case 'notFound':
        return t('adminShell.state.notFound.description');
      case 'runtimeUnconfigured':
        return t('adminShell.state.runtimeUnconfigured.description');
      case 'validation':
        return error.message;
      default:
        return t('adminShell.state.error.description');
    }
  })();

  const diagnostics = [
    error.problemCode
      ? `${t('adminShell.errorDetail.code')}: ${error.problemCode}`
      : '',
    error.traceId ? `${t('adminShell.errorDetail.traceId')}: ${error.traceId}` : '',
  ].filter(Boolean);

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/70 px-3 py-2 text-xs dark:border-rose-900/60 dark:bg-rose-950/30"
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
      <div className="min-w-0">
        <p className="font-medium text-rose-700 dark:text-rose-300">{title}</p>
        <p className="mt-0.5 leading-5 text-rose-600/90 dark:text-rose-300/80">{description}</p>
        {error.fieldErrors.length > 0 ? (
          <ul className="mt-1 space-y-0.5">
            {error.fieldErrors.map((field) => (
              <li key={`${field.field}:${field.code ?? ''}`} className="font-mono text-[11px]">
                {field.field}
                {field.code ? ` (${field.code})` : ''}
              </li>
            ))}
          </ul>
        ) : null}
        {diagnostics.length > 0 ? (
          <p className="mt-1 font-mono text-[10px] text-rose-500/80 dark:text-rose-400/70">
            {diagnostics.join(' · ')}
          </p>
        ) : null}
      </div>
    </div>
  );
}
