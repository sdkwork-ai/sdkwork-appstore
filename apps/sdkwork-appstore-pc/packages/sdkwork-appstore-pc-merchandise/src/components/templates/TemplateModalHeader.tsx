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
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-store-brand/10 text-store-brand">
              {t('templates.official')}
            </span>
          )}
        </div>
        <p className="text-xs text-store-ink-faint mt-1">
          {t('templates.modal.author')}: <span className="text-store-ink-soft font-medium ">{template.author}</span> · {template.framework}
        </p>
      </div>
    </div>
  );
};

