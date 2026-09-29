import React from 'react';

interface SkillCardTriggersProps {
  triggers: string[];
}

export const SkillCardTriggers: React.FC<SkillCardTriggersProps> = ({ triggers }) => {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {triggers.map((trigger, idx) => (
        <span
          key={idx}
          className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-store-surface text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/30"
        >
          {trigger}
        </span>
      ))}
    </div>
  );
};
