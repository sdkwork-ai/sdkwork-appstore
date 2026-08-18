import React from 'react';
import { Boxes, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const TemplatesHeaderBanner: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-900 dark:bg-[#12141c] border border-slate-800 p-6 md:p-8 text-white shadow-lg">
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          {t('templates.header.badge')}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          {t('templates.header.title')}
        </h1>
        <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
          {t('templates.header.subtitle')}
        </p>
      </div>

      <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
        <Boxes className="w-64 h-64 text-white" />
      </div>
    </div>
  );
};

