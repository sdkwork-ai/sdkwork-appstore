import type { ReactNode } from 'react';

export interface AdminKpiCardProps {
  label: string;
  /** Pre-formatted value; callers own number formatting. */
  value: string | number;
  icon?: ReactNode;
  /** Secondary line under the value, for example a period or delta. */
  hint?: string;
  /** Tints the icon well; defaults to neutral. */
  tone?: 'neutral' | 'positive' | 'warning' | 'critical' | 'info';
  /** Renders a skeleton in place of the value while loading. */
  loading?: boolean;
}

const TONE_CLASSES: Record<NonNullable<AdminKpiCardProps['tone']>, string> = {
  neutral: 'bg-gray-100 text-gray-500 dark:bg-[#20232c] dark:text-gray-300',
  positive: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
  critical: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
  info: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
};

/** Single operator KPI tile used across dashboard and analytics surfaces. */
export function AdminKpiCard({
  hint,
  icon,
  label,
  loading = false,
  tone = 'neutral',
  value,
}: AdminKpiCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-[#22252e] dark:bg-[#14161c]">
      <div className="flex items-center gap-2">
        {icon ? (
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
            {icon}
          </span>
        ) : null}
        <span className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      </div>
      {loading ? (
        <div className="mt-3 h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-[#252936]" />
      ) : (
        <p className="mt-3 text-xl font-semibold tabular-nums text-gray-900 dark:text-gray-50">{value}</p>
      )}
      {hint ? <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{hint}</p> : null}
    </div>
  );
}
