import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '@sdkwork/appstore-pc-core';
import { SkillTriggersList } from './SkillTriggersList';
import { SkillPromptPreview } from './SkillPromptPreview';

interface SkillOverviewTabProps {
  skill: SkillItem;
}

export const SkillOverviewTab: React.FC<SkillOverviewTabProps> = ({ skill }) => {
  const { t } = useTranslation();

  return (
    <>
      <div className="p-4 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line ">
        <h4 className="text-xs font-bold text-store-ink-faint uppercase tracking-wider mb-1">
          {t('skills.modal.summary')}
        </h4>
        <p className="text-sm leading-relaxed text-store-ink-soft ">
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
