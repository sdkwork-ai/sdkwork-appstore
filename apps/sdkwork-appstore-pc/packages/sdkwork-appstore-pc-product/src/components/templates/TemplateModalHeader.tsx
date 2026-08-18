import React from 'react';
import { useTranslation } from 'react-i18next';
import { TemplateItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface TemplateModalHeaderProps {
  template: TemplateItem;
}

export const TemplateModalHeader: React.FC<TemplateModalHeaderProps> = ({ template }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-start gap-4">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${template.iconColor} shrink-0`}>
        <DynamicIcon name={template.icon} className="w-7 h-7" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{template.title}</h2>
          {template.isOfficial && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
              {t('templates.official')}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {t('templates.modal.author')}: <span className="text-gray-700 dark:text-gray-300 font-medium">{template.author}</span> · {template.framework}
        </p>
      </div>
    </div>
  );
};

