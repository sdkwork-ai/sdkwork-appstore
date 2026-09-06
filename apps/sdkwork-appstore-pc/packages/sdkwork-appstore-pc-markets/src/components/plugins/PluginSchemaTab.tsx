import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy } from 'lucide-react';

interface PluginSchemaTabProps {
  apiSchemaType: string;
  schemaText: string;
  copiedSchema: boolean;
  onCopySchema: () => void;
}

export const PluginSchemaTab: React.FC<PluginSchemaTabProps> = ({
  apiSchemaType,
  schemaText,
  copiedSchema,
  onCopySchema,
}) => {
  const { t } = useTranslation();

  return (
    <div className="my-4 space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {t('plugins.modal.schemaStd')}: <strong>{apiSchemaType} 3.0</strong>
        </span>
        <button
          onClick={onCopySchema}
          className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
        >
          {copiedSchema ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>
            {copiedSchema ? t('plugins.modal.copiedSchema') : t('plugins.modal.copySchema')}
          </span>
        </button>
      </div>
      <pre className="p-4 rounded-2xl bg-gray-900 text-green-400 font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed border border-gray-800 select-text">
        {schemaText}
      </pre>
    </div>
  );
};
