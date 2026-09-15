import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AppstoreAdminPageInfo } from '@sdkwork/appstore-pc-admin-core';

export interface AdminPaginationBarProps {
  /** Normalized page metadata returned by the service port. */
  pageInfo: AppstoreAdminPageInfo;
  /** Number of rows currently loaded into the table. */
  loadedCount: number;
  /** Page forward using the backend cursor. */
  onNext?: (cursor: string) => void;
  /** Return to the first page. */
  onReset?: () => void;
  /** Whether a cursor is currently applied. */
  cursorApplied?: boolean;
  loading?: boolean;
}

/**
 * Cursor-aware operator pagination.
 *
 * The backend list contract pages with `cursor` + `pageSize`
 * (`PAGINATION_SPEC.md`), so the control offers "next" and "back to first page"
 * rather than fabricating page numbers the wire cannot address.
 */
export function AdminPaginationBar({
  cursorApplied = false,
  loadedCount,
  loading = false,
  onNext,
  onReset,
  pageInfo,
}: AdminPaginationBarProps) {
  const { t } = useTranslation();
  const nextCursor = pageInfo.nextCursor ?? '';
  const canPageForward = Boolean(nextCursor) && pageInfo.hasMore !== false && Boolean(onNext);
  const canReset = cursorApplied && Boolean(onReset);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-3">
        <span>{t('adminShell.common.totalItems', { total: loadedCount })}</span>
        {pageInfo.pageSize ? (
          <span className="font-mono text-[11px] text-gray-400 dark:text-gray-500">
            pageSize={pageInfo.pageSize}
          </span>
        ) : null}
        {pageInfo.mode === 'cursor' ? (
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500 dark:bg-[#20232c] dark:text-gray-400">
            cursor
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={canReset ? onReset : undefined}
          disabled={!canReset || loading}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 font-medium text-gray-600 transition-colors enabled:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#2f3442] dark:text-gray-300 dark:enabled:hover:bg-[#1d2028]"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          {t('adminShell.common.previousPage')}
        </button>
        <button
          type="button"
          onClick={canPageForward ? () => onNext?.(nextCursor) : undefined}
          disabled={!canPageForward || loading}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 font-medium text-gray-600 transition-colors enabled:hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#2f3442] dark:text-gray-300 dark:enabled:hover:bg-[#1d2028]"
        >
          {t('adminShell.common.nextPage')}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
