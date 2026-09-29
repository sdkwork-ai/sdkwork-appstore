import React, { useState } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface McpConfigSnippetProps {
  configSnippet: string;
}

export const McpConfigSnippet: React.FC<McpConfigSnippetProps> = ({ configSnippet }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(configSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 relative">
      <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-store-card border-b border-store-line text-xs text-store-ink-faint font-mono">
        <span className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-store-info" />
          mcp_config.json
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-store-info hover:text-store-info font-semibold cursor-pointer transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>{t('common.actions.copied', '已复制')}</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>{t('mcp.modal.copyConfig', '复制配置')}</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 rounded-b-store-card bg-slate-900 text-store-info text-xs font-mono overflow-x-auto leading-relaxed border border-store-line">
        {configSnippet}
      </pre>
    </div>
  );
};
