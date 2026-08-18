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
      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Terminal className="w-4 h-4 text-indigo-500" />
        {t('templates.modal.cliTitle')}
      </h4>
      <pre className="p-3.5 rounded-2xl bg-slate-900 text-indigo-300 text-xs font-mono border border-slate-800">
        {`npx sdkwork-create-app --template ${templateId}`}
      </pre>
    </div>
  );
};

