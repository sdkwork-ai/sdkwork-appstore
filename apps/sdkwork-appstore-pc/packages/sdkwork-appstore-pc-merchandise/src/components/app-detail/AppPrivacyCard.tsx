import React from 'react';
import { User } from 'lucide-react';

interface AppPrivacyCardProps {
  title: string;
  description: string;
  items: string[];
  iconColorClass?: string;
}

export const AppPrivacyCard: React.FC<AppPrivacyCardProps> = ({
  title,
  description,
  items,
  iconColorClass = "text-blue-600 dark:text-[#0A84FF]"
}) => {
  return (
    <div className="bg-gray-50 dark:bg-[#1C1C1E] p-5 rounded-2xl border border-gray-100 dark:border-[#2C2C2E]">
      <div className={`flex items-center gap-3 mb-3 ${iconColorClass}`}>
        <User className="w-6 h-6" />
        <h4 className="font-bold text-sm text-[#1C1C1E] dark:text-[#F5F5F5]">{title}</h4>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span 
            key={idx} 
            className="text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#2C2C2E] border border-gray-200 dark:border-transparent px-2 py-1 rounded"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
