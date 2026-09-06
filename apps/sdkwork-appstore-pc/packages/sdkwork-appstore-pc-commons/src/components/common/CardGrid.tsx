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
 * Column tiers (container inline-size):
 * - 1 column below 576px
 * - 2 columns from 576px
 * - 3 columns from 896px
 * - 4 columns from 1152px
 *
 * Every tier keeps the card width in a comfortable 260px+ range, and 4
 * columns is the designed maximum for wide screens.
 */
export function CardGrid({ children, className = '' }: CardGridProps) {
  return (
    <div
      className={`grid grid-cols-1 @xl:grid-cols-2 @4xl:grid-cols-3 @6xl:grid-cols-4 gap-4 w-full ${className}`}
    >
      {children}
    </div>
  );
}

export default CardGrid;
