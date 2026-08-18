import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ReleaseNoteLogItemProps {
  title: string;
  description: string;
}

export const ReleaseNoteLogItem: React.FC<ReleaseNoteLogItemProps> = ({
  title,
  description,
}) => {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
      <div>
        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">{title}</h4>
        <p className="text-[11px] text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
};
