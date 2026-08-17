import React from 'react';
import { Check, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '../../types';

interface SkillModalFooterProps {
  skill: SkillItem;
  onClose: () => void;
  onToggleInstall: (id: string) => void;
}

export const SkillModalFooter: React.FC<SkillModalFooterProps> = ({
  skill,
  onClose,
  onToggleInstall,
}) => {
  const { t } = useTranslation();

  return (
    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#262933] flex items-center justify-between shrink-0">
      <span className="text-xs text-gray-400 font-medium">
        {t('skills.modal.footerNote', '装载后自动注入 Agent 上下文模型')}
      </span>

      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222530] cursor-pointer transition-colors"
        >
          {t('common.actions.close')}
        </button>
        <button
          onClick={() => {
            onToggleInstall(skill.id);
            onClose();
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
            skill.isInstalled
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {skill.isInstalled ? (
            <>
              <Check className="w-4 h-4" />
              <span>{t('skills.modal.loadedSkill', '已加载到模型')}</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>{t('skills.modal.loadSkill', '一键装载技能')}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
