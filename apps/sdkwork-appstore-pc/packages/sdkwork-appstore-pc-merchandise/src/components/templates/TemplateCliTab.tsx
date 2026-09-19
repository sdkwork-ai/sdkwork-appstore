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
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Terminal className="w-4 h-4 text-indigo-400" />
            {t('templates.detail.cliTitle')}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{t('templates.detail.copiedCli')}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{t('templates.detail.copyCommand')}</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-3 rounded-xl bg-black/60 font-mono text-green-400 text-xs overflow-x-auto border border-slate-800 select-text">
          {cliCommand}
        </pre>
      </div>

      {/* Step by Step Workflow */}
      <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#20232d] border border-gray-200/60 dark:border-[#2a2d39] space-y-3">
        <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <FolderGit2 className="w-4 h-4 text-amber-500" />
          {t('templates.detail.workflowTitle')}
        </h4>

        <div className="space-y-2">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#181a21] border border-gray-200 dark:border-[#2a2d39]">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <div>
              <div className="font-bold text-gray-800 dark:text-gray-200">{t('templates.detail.step1Title')}</div>
              <div className="text-gray-500 text-[11px] font-mono mt-0.5">cd my-app && npm install</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#181a21] border border-gray-200 dark:border-[#2a2d39]">
            <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <div>
              <div className="font-bold text-gray-800 dark:text-gray-200">{t('templates.detail.step2Title')}</div>
              <div className="text-gray-500 text-[11px] font-mono mt-0.5">cp .env.example .env</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white dark:bg-[#181a21] border border-gray-200 dark:border-[#2a2d39]">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <div>
              <div className="font-bold text-gray-800 dark:text-gray-200">{t('templates.detail.step3Title')}</div>
              <div className="text-gray-500 text-[11px] font-mono mt-0.5">npm run dev</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
