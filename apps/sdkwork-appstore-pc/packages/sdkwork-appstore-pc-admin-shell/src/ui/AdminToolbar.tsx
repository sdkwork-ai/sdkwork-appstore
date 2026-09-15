import type { ReactNode } from 'react';

export interface AdminToolbarProps {
  /** Filter and search controls; laid out in a wrapping row. */
  children?: ReactNode;
  /** Right-aligned actions, typically refresh or export. */
  actions?: ReactNode;
  /** Optional second row for applied-filter chips or bulk actions. */
  footer?: ReactNode;
}

/** Filter / search / action bar placed directly above an operator data table. */
export function AdminToolbar({ actions, children, footer }: AdminToolbarProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-[#22252e] dark:bg-[#14161c]">
      <div className="flex flex-wrap items-end gap-3">
        {children ? <div className="flex flex-1 flex-wrap items-end gap-3">{children}</div> : null}
        {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
      </div>
      {footer ? (
        <div className="mt-3 border-t border-gray-100 pt-3 dark:border-[#1f232c]">{footer}</div>
      ) : null}
    </div>
  );
}
