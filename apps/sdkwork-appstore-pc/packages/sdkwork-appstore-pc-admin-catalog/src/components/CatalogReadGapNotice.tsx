import { AlertTriangle } from 'lucide-react';

export interface CatalogReadGapNoticeProps {
  /** Localized notice heading, resolved by the owning page from its fragment. */
  title: string;
  /** Localized notice body; it must state that catalog reads are unavailable. */
  description: string;
}

/**
 * Honest limitation banner shared by every catalog authoring page.
 *
 * The authoritative backend API exposes catalog *mutations* only, so no page can
 * browse existing categories, collections, or featured slots. Each page states
 * that up front instead of rendering an empty table that implies a listing
 * exists behind it (`BACKEND_UI_SPEC.md` §7: the console never fabricates
 * operator data).
 */
export function CatalogReadGapNotice({ description, title }: CatalogReadGapNoticeProps) {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-store-control border border-store-warning-soft bg-store-warning-soft px-3 py-2 text-xs "
    >
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-store-warning" />
      <div className="min-w-0">
        <p className="font-medium text-store-warning ">{title}</p>
        <p className="mt-0.5 leading-5 text-store-warning/90 dark:text-store-warning/80">{description}</p>
      </div>
    </div>
  );
}
