import React from 'react';
import { Sparkles, Bot, Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AIHubHeaderBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 p-6 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 relative overflow-hidden">
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('aihub.header.badge')}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          {t('aihub.header.title')}
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-2 leading-relaxed">
          {t('aihub.header.subtitle')}
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 flex items-center gap-2.5">
          <Bot className="w-5 h-5 text-slate-300 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-slate-100">{t('aihub.header.chatAssistant')}</div>
            <div className="text-[10px] text-slate-500">{t('aihub.header.chatAssistantVendors')}</div>
          </div>
        </div>
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80 flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-slate-300 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-slate-100">{t('aihub.header.knowledgeCopilot')}</div>
            <div className="text-[10px] text-slate-500">{t('aihub.header.knowledgeCopilotVendor')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
