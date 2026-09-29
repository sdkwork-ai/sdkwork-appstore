import type { ReactNode } from 'react';

/** Semantic tones used by operator status chips. */
export type AdminStatusTone =
  | 'neutral'
  | 'positive'
  | 'warning'
  | 'critical'
  | 'info'
  | 'pending';

const TONE_CLASSES: Record<AdminStatusTone, string> = {
  neutral: 'bg-store-subtle text-store-ink-soft  ',
  positive: 'bg-store-success-soft text-store-success  ',
  warning: 'bg-store-warning-soft text-store-warning  ',
  critical: 'bg-store-danger-soft text-store-danger  ',
  info: 'bg-blue-50 text-store-brand dark:bg-blue-950/40 ',
  pending: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400',
};

export interface AdminStatusBadgeProps {
  /** Localized label; mapping from backend enum tokens to copy is page-owned. */
  label: string;
  tone?: AdminStatusTone;
  /** Show the raw backend enum token next to the localized label. */
  token?: string;
  icon?: ReactNode;
}

/** Status chip used in operator tables and detail headers. */
export function AdminStatusBadge({
  icon,
  label,
  tone = 'neutral',
  token,
}: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]}`}
      title={token ?? label}
    >
      {icon}
      {label}
    </span>
  );
}
