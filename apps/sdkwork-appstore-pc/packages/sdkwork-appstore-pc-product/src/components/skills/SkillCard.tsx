import React from 'react';
import { SkillItem } from '../../types';
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
      className="group relative w-full h-full bg-white dark:bg-[#191b22] border border-gray-200/80 dark:border-[#262933] hover:border-purple-500/50 dark:hover:border-purple-500/50 p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col justify-between"
    >
      <div>
        {/* Subcomponent: Skill Header */}
        <SkillCardHeader skill={skill} />

        <p className="text-xs text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 leading-relaxed">
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

