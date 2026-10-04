import React, { useState } from 'react';
import { Terminal, Copy, Check, Play, FolderGit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TemplateCliTabProps {
  templateId: string;
  title: string;
}

export const TemplateCliTab: React.FC<TemplateCliTabProps> = ({ templateId, title }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const cliCommand = `npx sdkwork-create-app my-app --template ${templateId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* CLI Command Box */}
      <div className="p-4 rounded-store-card bg-slate-900 border border-store-line text-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-store-ink-faint font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-store-brand" />
            {t('templates.detail.cliTitle')}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-store-brand hover:text-store-brand font-bold cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-store-success" />
                <span className="text-store-success">{t('templates.detail.copiedCli')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t('templates.detail.copyCommand')}</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-3 rounded-store-control bg-store-overlay font-mono text-store-success text-xs overflow-x-auto border border-store-line select-text">
          {cliCommand}
        </pre>
      </div>

      {/* Step by Step Workflow */}
      <div className="p-4 rounded-store-card bg-store-subtle border border-store-line/60 dark:border-store-line space-y-3 ">
        <h4 className="text-[11px] font-bold text-store-ink-faint uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FolderGit2 className="w-4 h-4 text-store-warning" />
          {t('templates.detail.workflowTitle')}
        </h4>

        <div className="space-y-2">
          <div className="flex items-start gap-2.5 p-2.5 rounded-store-control bg-store-surface border border-store-line ">
            <span className="w-5 h-5 rounded-full bg-store-brand text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <div className="font-bold text-store-ink ">{t('templates.detail.step1Title')}</div>
              <div className="text-store-ink-faint text-[11px] font-mono mt-0.5">cd my-app && npm install</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-store-control bg-store-surface border border-store-line ">
            <span className="w-5 h-5 rounded-full bg-store-brand text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <div className="font-bold text-store-ink ">{t('templates.detail.step2Title')}</div>
              <div className="text-store-ink-faint text-[11px] font-mono mt-0.5">cp .env.example .env</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-store-control bg-store-surface border border-store-line ">
            <span className="w-5 h-5 rounded-full bg-store-success text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <div className="font-bold text-store-ink ">{t('templates.detail.step3Title')}</div>
              <div className="text-store-ink-faint text-[11px] font-mono mt-0.5">npm run dev</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
