import React from 'react';
import { Zap, Check, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '../../types';

interface SkillCardFooterProps {
  skill: SkillItem;
  onToggleInstall: (id: string) => void;
}

export const SkillCardFooter: React.FC<SkillCardFooterProps> = ({ skill, onToggleInstall }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-[#222530]">
      <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
        <Zap className="w-3.5 h-3.5 text-amber-500" />
        {(skill.activeCount / 1000).toFixed(1)}k {t('skills.modal.activeUses')}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleInstall(skill.id);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
          skill.isInstalled
            ? 'bg-purple-600 hover:bg-purple-700 text-white'
            : 'bg-gray-100 dark:bg-[#262a36] hover:bg-gray-200 dark:hover:bg-[#303545] text-gray-700 dark:text-gray-200'
        }`}
      >
        {skill.isInstalled ? (
          <>
            <Check className="w-3.5 h-3.5" />
            <span>{t('skills.modal.loadedSkill')}</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5" />
            <span>{t('skills.modal.loadSkill')}</span>
          </>
        )}
      </button>
    </div>
  );
};

