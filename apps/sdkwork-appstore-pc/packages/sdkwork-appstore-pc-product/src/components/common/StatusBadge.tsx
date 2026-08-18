import React from 'react';

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'active';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'info',
  showDot = true,
  className = '',
}) => {
  const variantStyles: Record<StatusVariant, { bg: string; text: string; border: string; dot: string }> = {
    success: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500',
    },
    active: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      dot: 'bg-emerald-500 animate-pulse',
    },
    warning: {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/20',
      dot: 'bg-amber-500',
    },
    error: {
      bg: 'bg-red-500/10 dark:bg-red-500/15',
      text: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/20',
      dot: 'bg-red-500',
    },
    info: {
      bg: 'bg-blue-500/10 dark:bg-blue-500/15',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/20',
      dot: 'bg-blue-500',
    },
    neutral: {
      bg: 'bg-gray-500/10 dark:bg-gray-500/15',
      text: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-500/20',
      dot: 'bg-gray-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      <span>{status}</span>
    </span>
  );
};
