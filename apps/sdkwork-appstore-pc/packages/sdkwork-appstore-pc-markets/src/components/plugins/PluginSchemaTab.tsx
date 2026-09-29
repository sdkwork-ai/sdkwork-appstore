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
      <div className="flex items-center justify-between text-xs text-store-ink-faint">
        <span>
          {t('plugins.modal.schemaStd')}: <strong>{apiSchemaType} 3.0</strong>
        </span>
        <button
          onClick={onCopySchema}
          className="flex items-center gap-1 text-store-brand hover:underline cursor-pointer font-medium "
        >
          {copiedSchema ? (
            <Check className="w-3.5 h-3.5 text-store-success" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>
            {copiedSchema ? t('plugins.modal.copiedSchema') : t('plugins.modal.copySchema')}
          </span>
        </button>
      </div>
      <pre className="p-4 rounded-store-card bg-gray-900 text-store-success font-mono text-[11px] overflow-x-auto max-h-60 leading-relaxed border border-store-line select-text">
        {schemaText}
      </pre>
    </div>
  );
};
