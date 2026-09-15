import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Ban, Inbox, Loader2, ServerCrash } from 'lucide-react';
import type { AppstoreAdminServiceError } from '@sdkwork/appstore-pc-admin-core';

/** Placeholder variants shared by every operator surface. */
export type AdminStateKind =
  | 'loading'
  | 'empty'
  | 'error'
  | 'denied'
  | 'notFound'
  | 'runtimeUnconfigured';

export interface AdminStatePlaceholderProps {
  kind: AdminStateKind;
  /** Normalized service error; drives the message and diagnostic footer. */
  error?: AppstoreAdminServiceError;
  /** Retry affordance, rendered for retryable failures. */
  onRetry?: () => void;
  /** Override the resolved title copy. */
  title?: string;
  /** Override the resolved description copy. */
  description?: string;
  /** Extra content, for example a permission code list. */
  children?: ReactNode;
  /** Compact rendering for inline (in-card) placement. */
  inline?: boolean;
}

/**
 * Uniform loading / empty / failure surface for operator pages.
 *
 * Failure copy is chosen from the stable error `kind`, never from the raw
 * transport message; the raw message, error code, operation id, and trace id
 * are surfaced separately as diagnostics (`I18N_SPEC.md` §7).
 */
export function AdminStatePlaceholder({
  children,
  description,
  error,
  inline = false,
  kind,
  onRetry,
  title,
}: AdminStatePlaceholderProps) {
  const { t } = useTranslation();
  const resolved = resolveStateCopy(kind, error, t, title, description);

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed text-center ${
        inline ? 'gap-1 px-4 py-8' : 'gap-2 px-6 py-16'
      } border-gray-300 dark:border-[#2a2e3a]`}
      role={kind === 'loading' ? undefined : 'status'}
    >
      <span className="text-gray-400 dark:text-gray-500">{resolved.icon}</span>
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{resolved.title}</h3>
      <p className="max-w-md text-xs leading-5 text-gray-500 dark:text-gray-400">
        {resolved.description}
      </p>
      {children}
      {onRetry && resolved.retryable ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-[#2f3442] dark:text-gray-200 dark:hover:bg-[#1d2028]"
        >
          {t('adminShell.state.retry')}
        </button>
      ) : null}
      {error ? <AdminErrorDiagnostics error={error} /> : null}
    </div>
  );
}

function resolveStateCopy(
  kind: AdminStateKind,
  error: AppstoreAdminServiceError | undefined,
  t: (key: string) => string,
  title: string | undefined,
  description: string | undefined,
): { title: string; description: string; icon: ReactNode; retryable: boolean } {
  const iconClassName = 'h-6 w-6';
  const effectiveKind: AdminStateKind =
    kind === 'error' && error
      ? error.kind === 'unauthorized'
        ? 'denied'
        : error.kind === 'forbidden'
          ? 'denied'
          : error.kind === 'notFound'
            ? 'notFound'
            : error.kind === 'runtimeUnconfigured'
              ? 'runtimeUnconfigured'
              : 'error'
      : kind;

  switch (effectiveKind) {
    case 'loading':
      return {
        title: title ?? t('adminShell.state.loading'),
        description: description ?? '',
        icon: <Loader2 className={`${iconClassName} animate-spin`} />,
        retryable: false,
      };
    case 'empty':
      return {
        title: title ?? t('adminShell.state.empty'),
        description: description ?? '',
        icon: <Inbox className={iconClassName} />,
        retryable: false,
      };
    case 'denied':
      return {
        title: title ?? t('adminShell.state.forbidden.title'),
        description: description ?? t('adminShell.state.forbidden.description'),
        icon: <Ban className={iconClassName} />,
        retryable: false,
      };
    case 'notFound':
      return {
        title: title ?? t('adminShell.state.notFound.title'),
        description: description ?? t('adminShell.state.notFound.description'),
        icon: <AlertTriangle className={iconClassName} />,
        retryable: false,
      };
    case 'runtimeUnconfigured':
      return {
        title: title ?? t('adminShell.state.runtimeUnconfigured.title'),
        description: description ?? t('adminShell.state.runtimeUnconfigured.description'),
        icon: <ServerCrash className={iconClassName} />,
        retryable: false,
      };
    default:
      return {
        title: title ?? t('adminShell.state.error.title'),
        description: description ?? t('adminShell.state.error.description'),
        icon: <AlertTriangle className={iconClassName} />,
        retryable: error?.isRetryable ?? true,
      };
  }
}

function AdminErrorDiagnostics({ error }: { error: AppstoreAdminServiceError }) {
  const { t } = useTranslation();
  const entries: { label: string; value: string }[] = [];
  if (error.problemCode) {
    entries.push({ label: t('adminShell.errorDetail.code'), value: error.problemCode });
  }
  if (error.operationId) {
    entries.push({ label: t('adminShell.errorDetail.operation'), value: error.operationId });
  }
  if (error.traceId) {
    entries.push({ label: t('adminShell.errorDetail.traceId'), value: error.traceId });
  }
  for (const field of error.fieldErrors) {
    entries.push({
      label: t('adminShell.errorDetail.field'),
      value: field.field,
    });
  }
  if (entries.length === 0) {
    return null;
  }
  return (
    <dl className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px] text-gray-400 dark:text-gray-500">
      {entries.map((entry) => (
        <div key={`${entry.label}:${entry.value}`} className="flex items-center gap-1">
          <dt>{entry.label}</dt>
          <dd className="text-gray-500 dark:text-gray-400">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}
