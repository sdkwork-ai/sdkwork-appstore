import type { ReactNode } from 'react';

export interface AdminFormFieldProps {
  label: string;
  /** Associates the label with the control for assistive technology. */
  htmlFor?: string;
  hint?: string;
  /** Field-level failure copy, typically resolved from an i18n key. */
  error?: string;
  required?: boolean;
  children: ReactNode;
  /** Full-width control by default; `inline` narrows it for filter bars. */
  layout?: 'block' | 'inline';
}

/** Label + hint + error wrapper for operator forms and filter bars. */
export function AdminFormField({
  children,
  error,
  hint,
  htmlFor,
  label,
  layout = 'block',
  required = false,
}: AdminFormFieldProps) {
  return (
    <div className={layout === 'inline' ? 'min-w-[10rem]' : 'w-full'}>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-xs font-medium text-store-ink-soft"
      >
        {label}
        {required ? <span className="ml-0.5 text-store-danger">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-store-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-store-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

/** Shared control styling for operator inputs, selects, and textareas.
 *
 *  The same skin as the shared `commons` field primitive — literally the same
 *  tokens, kept as a literal rather than imported because `admin-shell` does
 *  not depend on `commons`, and asserted equal to it by
 *  `scripts/check-control-shape.mjs` so the two copies can never drift.
 *
 *  It carries both shape deltas of the primitive because one string serves all
 *  three elements: `h-9` fixes the single-line height (and a textarea's
 *  `min-h-*` overrides it), while `py-2` supplies the vertical padding a
 *  textarea cannot get from a fixed height. */
export const ADMIN_INPUT_CLASS =
  'w-full rounded-store-control bg-store-field border border-store-line px-3 text-sm text-store-ink placeholder:text-store-ink-faint outline-none transition-colors focus:border-store-brand focus:ring-2 focus:ring-store-brand/25 disabled:cursor-not-allowed disabled:opacity-50 h-9 py-2';
