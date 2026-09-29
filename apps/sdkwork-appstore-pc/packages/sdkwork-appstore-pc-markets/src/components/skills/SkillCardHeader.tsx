import React from 'react';
import { SkillItem } from '@sdkwork/appstore-pc-core';
import { DynamicIcon } from '@sdkwork/appstore-pc-commons';

interface SkillCardHeaderProps {
  skill: SkillItem;
}

export const SkillCardHeader: React.FC<SkillCardHeaderProps> = ({ skill }) => {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${skill.iconColor}`}>
          <DynamicIcon name={skill.icon} className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-store-ink group-hover:text-purple-500 transition-colors truncate ">
            {skill.name}
          </h3>
          <p className="text-xs text-store-ink-faint truncate mt-0.5">
            {skill.author} · {skill.category}
          </p>
        </div>
      </div>

      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0">
        v{skill.version}
      </span>
    </div>
  );
};
