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
      bg: 'bg-store-success/10 dark:bg-store-success/15',
      text: 'text-store-success ',
      border: 'border-store-success/20',
      dot: 'bg-store-success',
    },
    active: {
      bg: 'bg-store-success/10 dark:bg-store-success/15',
      text: 'text-store-success ',
      border: 'border-store-success/20',
      dot: 'bg-store-success animate-pulse',
    },
    warning: {
      bg: 'bg-store-warning/10 dark:bg-store-warning/15',
      text: 'text-store-warning ',
      border: 'border-store-warning/20',
      dot: 'bg-store-warning',
    },
    error: {
      bg: 'bg-store-danger/10 dark:bg-store-danger/15',
      text: 'text-store-danger ',
      border: 'border-store-danger/20',
      dot: 'bg-store-danger',
    },
    info: {
      bg: 'bg-store-brand/10 dark:bg-store-brand/15',
      text: 'text-store-brand ',
      border: 'border-store-brand/20',
      dot: 'bg-store-brand',
    },
    neutral: {
      bg: 'bg-gray-500/10 dark:bg-gray-500/15',
      text: 'text-store-ink-soft ',
      border: 'border-gray-500/20',
      dot: 'bg-gray-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      <span>{status}</span>
    </span>
  );
};
