import type { ReactNode } from 'react'
import { cx } from './cx'

export interface TabItem<T extends string = string> {
  /** Stable value handed back to `onChange`. */
  value: T
  /** Visible label. */
  label: ReactNode
  /** Optional leading glyph. */
  icon?: ReactNode
  /** Optional trailing count chip. */
  count?: number
  disabled?: boolean
}

export interface TabsProps<T extends string = string> {
  items: ReadonlyArray<TabItem<T>>
  /** Currently selected value. */
  value: T
  onChange: (value: T) => void
  /**
   * `underline` for page-level section navigation, `segmented` for a compact
   * control inside a toolbar or filter row.
   */
  variant?: 'underline' | 'segmented'
  /** Accessible name for the tab list. */
  ariaLabel?: string
  className?: string
}

const UNDERLINE_BASE = 'relative inline-flex items-center gap-1.5 h-9 px-3 -mb-px border-b-2 text-sm transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-store-brand disabled:cursor-not-allowed disabled:opacity-50'
const SEGMENT_BASE = 'inline-flex flex-1 items-center justify-center gap-1.5 h-7 px-3 text-xs font-medium rounded-[7px] transition-colors outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-store-brand disabled:cursor-not-allowed disabled:opacity-50'

/**
 * The single tab primitive. Selection is a token swap plus a border/background
 * change, so the tab strip looks the same on every page and re-themes without a
 * remount.
 * @param props - items, selected value, change handler, and variant.
 * @returns the tab list element.
 */
export function Tabs<T extends string = string>({
  items,
  value,
  onChange,
  variant = 'underline',
  ariaLabel,
  className = '',
}: TabsProps<T>) {
  const segmented = variant === 'segmented'
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cx(
        segmented
          ? 'inline-flex items-center gap-1 p-1 rounded-store-control bg-store-subtle'
          : 'flex items-center gap-1 border-b border-store-line',
        className,
      )}
    >
      {items.map(item => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cx(
              segmented ? SEGMENT_BASE : UNDERLINE_BASE,
              active
                ? segmented
                  ? 'bg-store-raised text-store-ink shadow-sm rounded-store-control text-sm'
                  : 'border-store-brand text-store-ink font-medium'
                : segmented
                  ? 'text-store-ink-soft hover:text-store-ink'
                  : 'border-transparent text-store-ink-soft hover:text-store-ink',
            )}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
            {item.count === undefined ? null : (
              <span className="ml-0.5 rounded-full bg-store-subtle px-1.5 text-[10px] leading-4 text-store-ink-faint tabular-nums">
                {item.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
