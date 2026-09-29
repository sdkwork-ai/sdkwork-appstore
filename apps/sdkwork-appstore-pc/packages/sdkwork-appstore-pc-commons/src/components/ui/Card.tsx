import type { ReactNode } from 'react'
import { cx } from './cx'

export interface CardProps {
  /** Raise on hover; use for a card that is itself a link or button target. */
  interactive?: boolean
  /** Use the elevated surface (menus, popovers, modals) instead of the panel. */
  elevated?: boolean
  /** Pad the card. Set false when the card owns a full-bleed header. */
  padded?: boolean
  className?: string
  children: ReactNode
}

/**
 * The one card surface: panel fill, hairline border, shared card radius. Cards
 * used to pick their own radius and their own near-black grey, which is why two
 * pages could show the same card at different corner radii.
 * @param props - elevation, interactivity, padding, and content.
 * @returns the card element.
 */
export function Card({
  interactive = false,
  elevated = false,
  padded = true,
  className = '',
  children,
}: CardProps) {
  return (
    <div
      className={cx(
        'rounded-store-card border border-store-line',
        elevated ? 'bg-store-raised shadow-lg' : 'bg-store-surface',
        padded && 'p-4',
        interactive && 'transition-shadow hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  )
}
