import React from 'react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface SkillModalHeaderProps {
  skill: SkillItem;
}

export const SkillModalHeader: React.FC<SkillModalHeaderProps> = ({ skill }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-4 pr-10 shrink-0">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md ${skill.iconColor} shrink-0`}>
        <DynamicIcon name={skill.icon} className="w-8 h-8" />
      </div>
      <div>
        <h2 className="text-xl font-bold">{skill.name}</h2>
        <p className="text-xs text-gray-400 mt-1">
          {t('skills.modal.author', '作者')}: <span className="text-gray-700 dark:text-gray-300 font-medium">{skill.author}</span> · {t('skills.modal.category', '类别')}: {skill.category} · {t('skills.modal.version', '版本')}: v{skill.version}
        </p>
      </div>
    </div>
  );
};
