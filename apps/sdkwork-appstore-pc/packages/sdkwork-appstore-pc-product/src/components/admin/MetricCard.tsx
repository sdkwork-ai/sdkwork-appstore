import React, { ReactNode } from 'react';

interface MetricCardProps {
  title: string;
  icon: ReactNode;
  value: ReactNode;
  progress?: number;
  progressColor?: string;
  badge?: ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  icon,
  value,
  progress,
  progressColor = 'bg-blue-500',
  badge,
}) => {
  return (
    <div className="bg-gray-100/50 dark:bg-[#181a20] border border-gray-200 dark:border-[#22252e] rounded-2xl p-4">
      <div className="flex items-center justify-between text-xs text-gray-400 font-medium mb-2">
        <span>{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      {typeof progress === 'number' && (
        <div className="w-full h-1.5 bg-gray-200 dark:bg-[#282c38] rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
      {badge && <div className="mt-2">{badge}</div>}
    </div>
  );
};
