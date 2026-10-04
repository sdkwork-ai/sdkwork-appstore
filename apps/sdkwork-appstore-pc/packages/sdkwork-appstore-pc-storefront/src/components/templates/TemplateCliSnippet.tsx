import React from 'react';
import { Terminal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TemplateCliSnippetProps {
  templateId: string;
}

export const TemplateCliSnippet: React.FC<TemplateCliSnippetProps> = ({ templateId }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-4">
      <h4 className="text-xs font-bold text-store-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Terminal className="w-4 h-4 text-store-brand" />
        {t('templates.modal.cliTitle')}
      </h4>
      <pre className="p-3.5 rounded-store-card bg-slate-900 text-store-brand text-xs font-mono border border-store-line">
        {`npx sdkwork-create-app --template ${templateId}`}
      </pre>
    </div>
  );
};

