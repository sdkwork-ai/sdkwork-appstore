import React from 'react';

interface AppInfoRowProps {
  label: string;
  value: React.ReactNode;
  isLink?: boolean;
}

export const AppInfoRow: React.FC<AppInfoRowProps> = ({ label, value, isLink = false }) => {
  return (
    <div className="flex justify-between py-3 border-b border-store-line-soft last:border-0 ">
      <span className="text-sm text-store-ink-faint ">{label}</span>
      <span className={`text-sm font-medium ${isLink ? 'text-store-brand ' : 'text-store-ink '}`}>
        {value}
      </span>
    </div>
  );
};
