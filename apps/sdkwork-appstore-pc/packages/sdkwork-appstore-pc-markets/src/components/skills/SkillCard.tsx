import React from 'react';
import { SkillItem } from '@sdkwork/appstore-pc-core';
import { SkillCardHeader } from './SkillCardHeader';
import { SkillCardTriggers } from './SkillCardTriggers';
import { SkillCardFooter } from './SkillCardFooter';

interface SkillCardProps {
  skill: SkillItem;
  onToggleInstall: (id: string) => void;
  onSelect: (skill: SkillItem) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onToggleInstall,
  onSelect,
}) => {
  return (
    <div
      onClick={() => onSelect(skill)}
      className="group relative w-full h-full bg-store-surface border border-store-line/80 dark:border-store-line hover:border-purple-500/50 dark:hover:border-purple-500/50 p-4 rounded-store-card cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col justify-between "
    >
      <div>
        {/* Subcomponent: Skill Header */}
        <SkillCardHeader skill={skill} />

        <p className="text-xs text-store-ink-soft mt-3 line-clamp-2 leading-relaxed ">
          {skill.description}
        </p>

        {/* Subcomponent: Triggers List */}
        <SkillCardTriggers triggers={skill.triggers} />
      </div>

      {/* Subcomponent: Footer Actions */}
      <SkillCardFooter skill={skill} onToggleInstall={onToggleInstall} />
    </div>
  );
};

