import type { ReactNode } from 'react';

export interface AdminSectionProps {
  title: string;
  description?: string;
  /** Right-aligned section actions. */
  actions?: ReactNode;
  children: ReactNode;
  /** Reduce inner padding for nested sections. */
  compact?: boolean;
}

/** Card section grouping related operator content under one heading. */
export function AdminSection({
  actions,
  children,
  compact = false,
  description,
  title,
}: AdminSectionProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white dark:border-[#22252e] dark:bg-[#14161c]">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-gray-100 px-4 py-3 dark:border-[#1f232c]">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </header>
      <div className={compact ? 'p-3' : 'p-4'}>{children}</div>
    </section>
  );
}
