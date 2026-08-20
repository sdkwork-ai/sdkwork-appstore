import React from 'react';
import { Sparkles, Bot, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AIHubHeaderBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-[#12141c] border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white shadow-lg relative overflow-hidden">
      <div className="z-10 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('aihub.header.badge')}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {t('aihub.header.title')}
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
          {t('aihub.header.subtitle')}
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="z-10 grid grid-cols-2 gap-2 shrink-0">
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white">{t('aihub.header.chatAssistant')}</div>
            <div className="text-[10px] text-slate-400">{t('aihub.header.chatAssistantVendors')}</div>
          </div>
        </div>
        <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold text-white">{t('aihub.header.knowledgeCopilot')}</div>
            <div className="text-[10px] text-slate-400">{t('aihub.header.knowledgeCopilotVendor')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
