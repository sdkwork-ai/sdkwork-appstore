import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TemplateDetailBreadcrumbProps {
  templateId: string;
  onBack: () => void;
}

export const TemplateDetailBreadcrumb: React.FC<TemplateDetailBreadcrumbProps> = ({
  templateId,
  onBack,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-semibold text-store-ink-soft hover:text-store-brand transition-colors cursor-pointer group "
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>{t('templates.title', '应用模板库')}</span>
      </button>

      <div className="flex items-center gap-2 text-xs text-store-ink-faint ">
        <span className="px-2.5 py-1 rounded-store-control bg-store-subtle font-mono ">
          ID: {templateId}
        </span>
      </div>
    </div>
  );
};
