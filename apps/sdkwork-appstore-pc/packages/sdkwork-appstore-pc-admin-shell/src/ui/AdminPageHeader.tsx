import type { ReactNode } from 'react';

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned command area, typically refresh or create actions. */
  actions?: ReactNode;
  /** Secondary line rendered under the title, for example last-updated time. */
  meta?: ReactNode;
  /** Marks the header as belonging to a capability (adds a subtle rule). */
  bordered?: boolean;
}

/**
 * Standard operator page header: title, description, and command area.
 *
 * Every `pc-admin-*` page renders one so the console reads consistently and
 * capability pages never re-invent header spacing or typography.
 */
export function AdminPageHeader({
  actions,
  bordered = true,
  description,
  meta,
  title,
}: AdminPageHeaderProps) {
  return (
    <header
      className={`flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between${
        bordered ? 'mb-5 border-b border-store-line  ' : ''
      }`}
    >
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-store-ink ">{title}</h1>
        {description ? (
          <p className="mt-1 text-xs leading-5 text-store-ink-faint ">{description}</p>
        ) : null}
        {meta ? <div className="mt-1 text-xs text-store-ink-faint ">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}
