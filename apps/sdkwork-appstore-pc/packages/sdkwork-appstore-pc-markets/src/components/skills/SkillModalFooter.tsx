import React from 'react';
import { Check, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SkillItem } from '@sdkwork/appstore-pc-core';

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
    <div className="mt-5 pt-4 border-t border-store-line-soft flex items-center justify-between shrink-0 ">
      <span className="text-xs text-store-ink-faint font-medium">
        {t('skills.modal.footerNote', '装载后自动注入 Agent 上下文模型')}
      </span>

      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-store-control text-xs font-medium text-store-ink-soft hover:bg-store-subtle cursor-pointer transition-colors "
        >
          {t('common.actions.close')}
        </button>
        <button
          onClick={() => {
            onToggleInstall(skill.id);
            onClose();
          }}
          className={`flex items-center gap-2 px-5 py-2 rounded-store-control text-xs font-medium text-white shadow-md transition-all cursor-pointer ${
            skill.isInstalled
              ? 'bg-purple-600 hover:bg-purple-700'
              : 'bg-store-success hover:bg-store-success-hover'
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
