import type { ReactNode } from 'react';

export interface AdminDetailEntry {
  label: string;
  value: ReactNode;
  /** Renders the value in a monospace diagnostic style (ids, enums). */
  mono?: boolean;
  /** Let the value span the full row for long text such as reasons. */
  wide?: boolean;
}

export interface AdminDetailListProps {
  entries: readonly AdminDetailEntry[];
  /** Column count at the `lg` breakpoint. */
  columns?: 1 | 2 | 3;
}

const COLUMN_CLASSES: Record<1 | 2 | 3, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
};

/** Key/value grid used by operator detail drawers and review inspectors. */
export function AdminDetailList({ columns = 2, entries }: AdminDetailListProps) {
  if (entries.length === 0) {
    return null;
  }
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-3 ${COLUMN_CLASSES[columns]}`}>
      {entries.map((entry) => (
        <div
          key={entry.label}
          className={entry.wide ? 'sm:col-span-2 lg:col-span-3' : undefined}
        >
          <dt className="text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {entry.label}
          </dt>
          <dd
            className={`mt-0.5 break-words text-sm text-gray-800 dark:text-gray-100 ${
              entry.mono ? 'font-mono text-[13px]' : ''
            }`}
          >
            {entry.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
