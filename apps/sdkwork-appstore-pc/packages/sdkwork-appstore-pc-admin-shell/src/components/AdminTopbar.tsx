import type { ReactNode } from 'react';
import { AdminBreadcrumb, type AdminBreadcrumbItem } from './AdminBreadcrumb';

export interface AdminTopbarProps {
  breadcrumb: readonly AdminBreadcrumbItem[];
  /** Right-aligned status or utility content. */
  trailing?: ReactNode;
}

/** Sticky console top bar carrying the breadcrumb trail and utility slot. */
export function AdminTopbar({ breadcrumb, trailing }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center justify-between gap-4 border-b border-gray-200 bg-white/90 px-5 backdrop-blur dark:border-[#22252e] dark:bg-[#14161c]/90">
      <AdminBreadcrumb items={breadcrumb} />
      {trailing ? <div className="flex items-center gap-2">{trailing}</div> : null}
    </header>
  );
}
