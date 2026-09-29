import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface AdminBreadcrumbItem {
  label: string;
  /** Navigable target; the trailing item omits it. */
  to?: string;
}

export interface AdminBreadcrumbProps {
  items: readonly AdminBreadcrumbItem[];
}

/** Console breadcrumb: `Console / <capability> / <page>`. */
export function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  return (
    <ol className="flex min-w-0 items-center gap-1 text-xs text-store-ink-faint ">
      {items.map((item, index) => (
        <Fragment key={`${item.label}:${index}`}>
          {index > 0 ? (
            <ChevronRight className="h-3 w-3 shrink-0 text-store-ink-faint " />
          ) : null}
          <li className="min-w-0 truncate">
            {item.to ? (
              <Link className="transition-colors hover:text-store-ink " to={item.to}>
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-store-ink ">{item.label}</span>
            )}
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
