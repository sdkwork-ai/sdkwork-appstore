import type { ReactNode } from 'react'
import { cx } from './cx'

/** Semantic tone of a tag or status badge. */
export type TagTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

export interface TagProps {
  tone?: TagTone
  /** Optional leading glyph. */
  icon?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * Tone → (fill, dot). The *label* always uses the primary ink token: the
 * tinted fill alone is around 1.1:1 against its own text at these alphas, so
 * writing the tone colour into the text would drop the tag below the AA
 * contrast the design spec requires (§7). The tone still reads, through the
 * fill and the dot.
 */
const TONE: Record<TagTone, string> = {
  neutral: 'bg-store-subtle text-store-ink-soft',
  brand: 'bg-store-brand-soft text-store-ink',
  success: 'bg-store-success/12 text-store-ink',
  warning: 'bg-store-warning/12 text-store-ink',
  danger: 'bg-store-danger/12 text-store-ink',
  info: 'bg-store-info/12 text-store-ink',
}

const DOT: Record<TagTone, string> = {
  neutral: 'bg-store-ink-faint',
  brand: 'bg-store-brand',
  success: 'bg-store-success',
  warning: 'bg-store-warning',
  danger: 'bg-store-danger',
  info: 'bg-store-info',
}

/**
 * Compact status/label chip. One shape, one type scale and one tone table for
 * the whole application, so a status never renders as a different chip on the
 * next page.
 * @param props - tone, optional glyph, and label content.
 * @returns the tag element.
 */
export function Tag({ tone = 'neutral', icon, className = '', children }: TagProps) {
  return (
    <span
      className={cx(
        'inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        TONE[tone],
        className,
      )}
    >
      {icon ?? <span className={cx('h-1.5 w-1.5 shrink-0 rounded-full', DOT[tone])} aria-hidden="true" />}
      <span className="truncate">{children}</span>
    </span>
  )
}
