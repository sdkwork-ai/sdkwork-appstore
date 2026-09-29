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
  neutral: 'bg-store-subtle text-store-ink-faint  ',
  positive: 'bg-store-success-soft text-store-success  ',
  warning: 'bg-store-warning-soft text-store-warning  ',
  critical: 'bg-store-danger-soft text-store-danger  ',
  info: 'bg-blue-50 text-store-brand dark:bg-blue-950/40 ',
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
    <div className="rounded-store-card border border-store-line bg-store-surface p-4 ">
      <div className="flex items-center gap-2">
        {icon ? (
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
            {icon}
          </span>
        ) : null}
        <span className="truncate text-xs font-medium text-store-ink-faint ">{label}</span>
      </div>
      {loading ? (
        <div className="mt-3 h-6 w-20 animate-pulse rounded-store-control bg-store-raised " />
      ) : (
        <p className="mt-3 text-xl font-semibold tabular-nums text-store-ink ">{value}</p>
      )}
      {hint ? <p className="mt-1 text-[11px] text-store-ink-faint ">{hint}</p> : null}
    </div>
  );
}
