import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cx } from './cx'

/** Visual weight of a button. */
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'

/** Control height: `sm` 32px, `md` 36px, `lg` 40px. One scale for the whole app. */
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Weight of the action. Defaults to `primary`. */
  variant?: ButtonVariant
  /** Height step. Defaults to `md`. */
  size?: ButtonSize
  /**
   * Pill shape. Reserved for the acquire/install call to action, which
   * `UI_DESIGN_SPEC.md` §4.5 specifies as a capsule; every other button uses
   * the shared control radius so the same action never rounds differently
   * between pages.
   */
  pill?: boolean
  /** Stretch to the container width. */
  block?: boolean
  /** Leading glyph, usually a `lucide-react` icon. */
  icon?: ReactNode
  /** Trailing glyph. */
  trailingIcon?: ReactNode
}

const BASE = 'inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-store-brand focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50'

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-store-brand text-store-on-brand hover:bg-store-brand-hover',
  secondary: 'bg-store-subtle text-store-ink border border-store-line hover:bg-store-raised',
  outline: 'bg-transparent text-store-ink border border-store-line-strong hover:bg-store-subtle',
  ghost: 'bg-transparent text-store-ink-soft hover:bg-store-subtle hover:text-store-ink',
  danger: 'bg-store-danger text-store-on-brand hover:opacity-90',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
}

/**
 * The single button primitive. Every action in the application renders through
 * it, which is what keeps buttons identical across pages: colours come from the
 * semantic tokens in `src/index.css`, never from a palette utility written at
 * the call site.
 * @param props - variant, size, optional glyphs, and native button attributes.
 * @returns the button element.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  pill = false,
  block = false,
  icon,
  trailingIcon,
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        BASE,
        VARIANT[variant],
        SIZE[size],
        pill ? 'rounded-full' : 'rounded-store-control',
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
      {trailingIcon}
    </button>
  )
}
