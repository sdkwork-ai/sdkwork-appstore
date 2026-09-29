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
    <div className="rounded-store-card border border-store-line bg-store-surface p-3 ">
      <div className="flex flex-wrap items-end gap-3">
        {children ? <div className="flex flex-1 flex-wrap items-end gap-3">{children}</div> : null}
        {actions ? <div className="ml-auto flex items-center gap-2">{actions}</div> : null}
      </div>
      {footer ? (
        <div className="mt-3 border-t border-store-line-soft pt-3 ">{footer}</div>
      ) : null}
    </div>
  );
}
