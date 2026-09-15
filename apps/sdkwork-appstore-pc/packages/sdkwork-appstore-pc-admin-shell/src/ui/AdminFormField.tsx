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
        className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
      >
        {label}
        {required ? <span className="ml-0.5 text-rose-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}

/** Shared control styling for operator inputs, selects, and textareas. */
export const ADMIN_INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 dark:border-[#2f3442] dark:bg-[#181a20] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-[#3a4050]';
