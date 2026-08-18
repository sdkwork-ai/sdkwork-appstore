import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '../../types';
import { SkillTriggersList } from './SkillTriggersList';
import { SkillPromptPreview } from './SkillPromptPreview';

interface SkillOverviewTabProps {
  skill: SkillItem;
}

export const SkillOverviewTab: React.FC<SkillOverviewTabProps> = ({ skill }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39]">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {t('skills.modal.summary')}
        </h4>
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
          {skill.description}
        </p>
      </div>

      <SkillTriggersList triggers={skill.triggers} />

      <SkillPromptPreview
        promptTemplate={skill.promptTemplate}
        skillMarkdown={skill.skillMarkdown}
      />
    </>
  );
};
