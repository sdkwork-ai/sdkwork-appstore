import React from 'react';

interface CardGridProps {
  children: React.ReactNode;
  /** Extra classes appended to the grid container (e.g. custom gap). */
  className?: string;
}

/**
 * Shared responsive card grid for AI Lab catalog pages
 * (experts, skills, plugins, MCP, templates).
 *
 * Uses Tailwind v4 container queries: the column count is decided by the
 * nearest `@container` ancestor (each page root), so it adapts to the actual
 * content area width — sidebar, window snapping and zoom all accounted for —
 * instead of the raw viewport width.
 *
 * Column tiers (container inline-size) — 4 columns is the DEFAULT desktop
 * layout: the tier starts at 48rem (768px), which every embedded desktop
 * panel (BirdCoder markets column, full appstore window) clears comfortably,
 * while narrow side panels still adapt down:
 * - 1 column below 384px
 * - 2 columns from 384px  (@sm  = 24rem)
 * - 3 columns from 512px  (@lg  = 32rem)
 * - 4 columns from 768px  (@3xl = 48rem, the typical desktop panel width)
 *
 * The @-tier names map to `--container-*` theme sizes (NOT the viewport
 * breakpoints), ascending in min-width: @sm 24rem < @lg 32rem < @3xl 48rem,
 * so the ramp resolves 1 → 2 → 3 → 4 as the page grows. Embedded hosts keep
 * the card width in a ~200px+ range on 4-column desktop panels.
 */
export function CardGrid({ children, className = '' }: CardGridProps) {
  return (
    <div
      className={`grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 @3xl:grid-cols-4 gap-4 w-full ${className}`}
    >
      {children}
    </div>
  );
}

export default CardGrid;
