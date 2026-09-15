import type { ReactNode } from 'react';

/** Column definition for {@link AdminDataTable}. */
export interface AdminTableColumn<TRow> {
  /** Stable column key, unique within the table. */
  key: string;
  /** Localized header content. */
  header: ReactNode;
  /** Cell renderer. Receives the row and its index for stable keys. */
  render: (row: TRow, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  /** Tailwind width utility, for example `w-32`. */
  width?: string;
  /** Hide the column below the `lg` breakpoint for dense operator tables. */
  hideBelowLarge?: boolean;
}

export interface AdminDataTableProps<TRow> {
  columns: readonly AdminTableColumn<TRow>[];
  rows: readonly TRow[];
  rowKey: (row: TRow, index: number) => string;
  /** Rendered inside the table body when `rows` is empty and not loading. */
  emptyContent: ReactNode;
  /** Rendered in place of the body while the first load is in flight. */
  loadingContent?: ReactNode;
  loading?: boolean;
  onRowClick?: (row: TRow) => void;
  /** Accessible table caption; visually hidden. */
  caption?: string;
  /** Reduce vertical padding for high-density operator grids. */
  dense?: boolean;
}

const ALIGN_CLASSES: Record<NonNullable<AdminTableColumn<unknown>['align']>, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Generic operator data table.
 *
 * Owns the console's table chrome (sticky header, density, horizontal scroll,
 * empty and loading states) so capability pages only declare columns and rows.
 */
export function AdminDataTable<TRow>({
  caption,
  columns,
  dense = false,
  emptyContent,
  loading = false,
  loadingContent,
  onRowClick,
  rowKey,
  rows,
}: AdminDataTableProps<TRow>) {
  const cellPadding = dense ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-[#22252e] dark:bg-[#14161c]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50/70 dark:border-[#22252e] dark:bg-[#191c23]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`${cellPadding} ${column.width ?? ''} ${
                    ALIGN_CLASSES[column.align ?? 'left']
                  } ${
                    column.hideBelowLarge ? 'hidden lg:table-cell' : ''
                  } text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && loadingContent ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {loadingContent}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-0">
                  {emptyContent}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`border-b border-gray-100 last:border-b-0 dark:border-[#1f232c] ${
                    onRowClick
                      ? 'cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-[#191c23]'
                      : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`${cellPadding} ${ALIGN_CLASSES[column.align ?? 'left']} ${
                        column.hideBelowLarge ? 'hidden lg:table-cell' : ''
                      } text-gray-700 dark:text-gray-200`}
                    >
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
