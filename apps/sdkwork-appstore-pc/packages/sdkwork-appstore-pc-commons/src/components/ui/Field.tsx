import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cx } from './cx'

/**
 * The one control skin: surface, border, radius, focus ring and disabled state
 * for every text field, select and textarea. Exported so a bespoke control can
 * still join the system instead of writing its own border and focus colour.
 */
export const FIELD_CONTROL = 'w-full rounded-store-control bg-store-field border border-store-line px-3 text-sm text-store-ink placeholder:text-store-ink-faint outline-none transition-colors focus:border-store-brand focus:ring-2 focus:ring-store-brand/25 disabled:cursor-not-allowed disabled:opacity-50'

export interface FieldProps {
  label?: ReactNode
  /** Help text under the control; replaced by `error` when that is set. */
  hint?: ReactNode
  error?: ReactNode
  required?: boolean
  className?: string
  /** Rendered under the label, right-aligned siblings sit in the same row. */
  action?: ReactNode
  children: (controlId: string) => ReactNode
}

/**
 * Label + control + message wrapper. Rendering the control through a function
 * of the generated id keeps `htmlFor`/`id` paired without the caller
 * hand-wiring a `useId`.
 * @param props - label, messages, and a control renderer.
 * @returns the field element.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  className = '',
  action,
  children,
}: FieldProps) {
  const controlId = useId()
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {(label || action) && (
        <div className="flex items-end justify-between gap-2">
          {label ? (
            <label htmlFor={controlId} className="text-xs font-medium text-store-ink-soft">
              {label}
              {required ? <span className="ml-0.5 text-store-danger">*</span> : null}
            </label>
          ) : <span />}
          {action}
        </div>
      )}
      {children(controlId)}
      {error ? (
        <p className="text-xs text-store-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-store-ink-faint">{hint}</p>
      ) : null}
    </div>
  )
}

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Glyph rendered inside the field on the leading edge. */
  leadingIcon?: ReactNode
}

/** Text input on the shared control skin. */
export function TextInput({ className = '', leadingIcon, ...rest }: TextInputProps) {
  if (!leadingIcon) return <input className={cx(FIELD_CONTROL, 'h-9', className)} {...rest} />
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-store-ink-faint">
        {leadingIcon}
      </span>
      <input className={cx(FIELD_CONTROL, 'h-9 pl-9', className)} {...rest} />
    </div>
  )
}

/** Select on the shared control skin. */
export function SelectInput({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(FIELD_CONTROL, 'h-9 cursor-pointer', className)} {...rest}>
      {children}
    </select>
  )
}

/** Textarea on the shared control skin. */
export function TextArea({ className = '', rows = 4, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cx(FIELD_CONTROL, 'py-2 leading-5 resize-y', className)} {...rest} />
}
