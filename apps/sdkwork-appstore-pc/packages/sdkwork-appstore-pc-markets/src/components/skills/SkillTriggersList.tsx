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
      <h4 className="text-xs font-bold text-store-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Terminal className="w-4 h-4 text-store-brand" />
        {t('skills.modal.triggersTitle', '激活指令 (@Triggers)')}
      </h4>
      <div className="flex flex-wrap gap-2">
        {triggers.map((trigger, idx) => (
          <span
            key={idx}
            className="text-xs font-mono font-medium px-2.5 py-0.5 rounded-full bg-store-subtle text-store-ink-soft"
          >
            {trigger}
          </span>
        ))}
      </div>
    </div>
  );
};
