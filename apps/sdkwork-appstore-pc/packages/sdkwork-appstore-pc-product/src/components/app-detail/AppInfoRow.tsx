import React from 'react';

interface AppInfoRowProps {
  label: string;
  value: React.ReactNode;
  isLink?: boolean;
}

export const AppInfoRow: React.FC<AppInfoRowProps> = ({ label, value, isLink = false }) => {
  return (
    <div className="flex justify-between py-3 border-b border-gray-100 dark:border-[#2C2C2E] last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${isLink ? 'text-blue-600 dark:text-[#0A84FF]' : 'text-[#1C1C1E] dark:text-[#F5F5F5]'}`}>
        {value}
      </span>
    </div>
  );
};
