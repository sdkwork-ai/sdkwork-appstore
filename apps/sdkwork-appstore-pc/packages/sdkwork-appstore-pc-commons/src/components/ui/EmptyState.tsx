import type { ReactNode } from 'react'
import { cx } from './cx'

export interface EmptyStateProps {
  /** Illustration or icon shown above the title. */
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Primary recovery action, e.g. a retry or "go discover" button. */
  action?: ReactNode
  /** Render inside a dashed card instead of a bare block. */
  boxed?: boolean
  className?: string
}

/**
 * The one empty/error placeholder. `UI_DESIGN_SPEC.md` §4.10 requires every
 * list to show an illustration, a title and a call to action; routing every
 * list through this component is what makes those placeholders agree instead of
 * each page inventing its own `py-16 text-center` block.
 * @param props - icon, copy, optional action, and container treatment.
 * @returns the placeholder element.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  boxed = false,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center gap-2 py-16 text-center',
        boxed && 'rounded-store-card border border-dashed border-store-line-strong bg-store-surface',
        className,
      )}
    >
      {icon ? (
        <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-store-card bg-store-subtle text-store-ink-faint">
          {icon}
        </div>
      ) : null}
      <h3 className="text-[15px] font-semibold leading-6 text-store-ink">{title}</h3>
      {description ? (
        <p className="max-w-[22rem] text-[13px] leading-5 text-store-ink-faint">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}
