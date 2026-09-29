import { Link } from 'react-router-dom';
import type { StoreListingCard } from '@/hooks/catalog';
import { PlatformBadges } from '@/components/common/PlatformBadges';
import { readListingPlatformCodes } from '@/platforms';

interface ListingRowProps {
  app: StoreListingCard;
  /** Optional leading rank badge (charts). */
  rank?: number;
}

/**
 * Horizontal listing card shared by charts / category / collection / event
 * pages (`COMPONENT_SPEC.md`: one visual primitive, one responsibility).
 */
export function ListingRow({ app, rank }: ListingRowProps) {
  return (
    <Link to={`/app/${app.id}`} className="card card-press flex items-center gap-3 p-3">
      {rank !== undefined && (
        <span
          className={`w-7 text-center text-sm font-bold ${
            rank <= 3 ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
          }`}
        >
          {rank}
        </span>
      )}
      <div
        className="app-icon flex h-12 w-12 flex-shrink-0 items-center justify-center text-sm font-bold text-white"
        style={{ background: 'linear-gradient(135deg, var(--accent), #5856d6)' }}
      >
        {app.name[0]?.toUpperCase() ?? 'A'}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">{app.name}</h3>
        <p className="truncate text-xs text-[var(--text-tertiary)]">{app.developer}</p>
        <PlatformBadges
          platforms={readListingPlatformCodes(app as unknown as Record<string, unknown>)}
          max={2}
          className="mt-0.5"
        />
      </div>
      <div className="flex flex-col items-end gap-1">
        {app.rating > 0 && (
          <span className="text-xs text-[var(--text-secondary)]">{app.rating.toFixed(1)}★</span>
        )}
        {app.pricingModel === 'PAID' && (
          <span className="text-[10px] text-[var(--accent)]">付费</span>
        )}
      </div>
    </Link>
  );
}
