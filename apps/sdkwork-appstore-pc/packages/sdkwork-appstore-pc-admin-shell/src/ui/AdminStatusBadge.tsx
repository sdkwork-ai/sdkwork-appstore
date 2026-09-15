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
  neutral: 'bg-gray-100 text-gray-600 dark:bg-[#20232c] dark:text-gray-300',
  positive: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
  critical: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
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
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${TONE_CLASSES[tone]}`}
      title={token ?? label}
    >
      {icon}
      {label}
    </span>
  );
}
