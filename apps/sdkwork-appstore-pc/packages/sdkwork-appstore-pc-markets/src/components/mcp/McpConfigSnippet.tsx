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
      <div className="flex items-center justify-between bg-slate-950 px-4 py-2 rounded-t-2xl border-b border-slate-800 text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          mcp_config.json
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer transition-colors"
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
      <pre className="p-4 rounded-b-2xl bg-slate-900 text-cyan-300 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
        {configSnippet}
      </pre>
    </div>
  );
};
