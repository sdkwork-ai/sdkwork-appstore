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
  iconColorClass = "text-store-brand "
}) => {
  return (
    <div className="bg-store-subtle p-5 rounded-store-card border border-store-line-soft ">
      <div className={`flex items-center gap-3 mb-3 ${iconColorClass}`}>
        <User className="w-6 h-6" />
        <h4 className="font-bold text-sm text-store-ink ">{title}</h4>
      </div>
      <p className="text-xs text-store-ink-faint leading-relaxed ">
        {description}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span 
            key={idx} 
            className="text-xs font-medium text-store-ink-soft bg-store-raised border border-store-line px-2.5 py-0.5 rounded-full "
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
