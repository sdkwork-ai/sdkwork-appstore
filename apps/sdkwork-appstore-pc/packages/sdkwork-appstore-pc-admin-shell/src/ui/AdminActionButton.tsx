import type { ReactNode } from 'react';

export interface AdminActionButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  /** Accessible label when the visible content is icon-only. */
  ariaLabel?: string;
  title?: string;
}

const VARIANT_CLASSES: Record<NonNullable<AdminActionButtonProps['variant']>, string> = {
  primary:
    'bg-gray-900 text-white enabled:hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:enabled:hover:bg-white',
  secondary:
    'border border-gray-300 text-gray-700 enabled:hover:bg-gray-100 dark:border-[#2f3442] dark:text-gray-200 dark:enabled:hover:bg-[#1d2028]',
  danger:
    'border border-rose-300 text-rose-600 enabled:hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 dark:enabled:hover:bg-rose-950/30',
  ghost:
    'text-gray-600 enabled:hover:bg-gray-100 dark:text-gray-300 dark:enabled:hover:bg-[#1d2028]',
};

const SIZE_CLASSES: Record<NonNullable<AdminActionButtonProps['size']>, string> = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3.5 py-2 text-sm',
};

/** Operator command button with a consistent disabled/pending treatment. */
export function AdminActionButton({
  ariaLabel,
  children,
  disabled = false,
  loading = false,
  onClick,
  size = 'sm',
  title,
  type = 'button',
  variant = 'secondary',
}: AdminActionButtonProps) {
  const isInert = disabled || loading;
  return (
    <button
      type={type}
      aria-label={ariaLabel}
      title={title}
      onClick={isInert ? undefined : onClick}
      disabled={isInert}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]}`}
    >
      {children}
    </button>
  );
}
