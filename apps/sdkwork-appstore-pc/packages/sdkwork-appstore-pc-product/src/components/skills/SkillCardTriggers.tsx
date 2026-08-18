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
          className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-[#232030] text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-900/30"
        >
          {trigger}
        </span>
      ))}
    </div>
  );
};
