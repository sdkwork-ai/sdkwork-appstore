import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resolveTemplateAppType } from '@sdkwork/appstore-pc-core';
import { TemplateItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface TemplateCardHeaderProps {
  template: TemplateItem;
}

export const TemplateCardHeader: React.FC<TemplateCardHeaderProps> = ({ template }) => {
  const { t } = useTranslation();
  const appType = resolveTemplateAppType(template.platform);
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${template.iconColor}`}>
          <DynamicIcon name={template.icon} className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-sm text-store-ink group-hover:text-store-brand transition-colors truncate ">
              {template.title}
            </h3>
            {template.isOfficial && (
              <CheckCircle2 className="w-4 h-4 text-store-brand shrink-0" />
            )}
            {template.platform && (
              <span
                className="max-w-[50%] truncate px-1.5 py-0.5 rounded-full bg-store-subtle border border-store-line text-store-ink-soft text-[10px] font-medium leading-none shrink-0"
                data-template-app-type={appType?.code ?? template.platform}
              >
                {appType ? t(`templates.platforms.${appType.labelKey}`) : template.platform}
              </span>
            )}
          </div>
          <p className="text-xs text-store-ink-faint truncate mt-0.5">
            {template.author} · {template.framework}
          </p>
        </div>
      </div>
    </div>
  );
};
