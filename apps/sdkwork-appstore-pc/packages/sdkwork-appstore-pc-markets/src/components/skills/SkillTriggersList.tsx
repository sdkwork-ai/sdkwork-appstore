import React from 'react';
import { Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SkillTriggersListProps {
  triggers: string[];
}

export const SkillTriggersList: React.FC<SkillTriggersListProps> = ({ triggers }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Terminal className="w-4 h-4 text-purple-500" />
        {t('skills.modal.triggersTitle', '激活指令 (@Triggers)')}
      </h4>
      <div className="flex flex-wrap gap-2">
        {triggers.map((trigger, idx) => (
          <span
            key={idx}
            className="text-xs font-mono font-medium px-3 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-300 border border-purple-500/20"
          >
            {trigger}
          </span>
        ))}
      </div>
    </div>
  );
};
