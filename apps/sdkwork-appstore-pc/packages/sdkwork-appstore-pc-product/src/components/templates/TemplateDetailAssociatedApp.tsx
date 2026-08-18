import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, ArrowRight } from 'lucide-react';
import { AppItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';

interface TemplateDetailAssociatedAppProps {
  relatedApp: AppItem;
}

export const TemplateDetailAssociatedApp: React.FC<TemplateDetailAssociatedAppProps> = ({ relatedApp }) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-slate-900 dark:bg-[#12141c] text-white shadow-md relative overflow-hidden border border-slate-800">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
          <div
            className={`w-16 h-16 rounded-2xl ${
              relatedApp.iconColor || 'bg-blue-600'
            } flex items-center justify-center text-white shadow-md shrink-0`}
          >
            <DynamicIcon name={relatedApp.icon || 'Boxes'} className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-semibold border border-blue-500/20">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{t('templates.detail.builtFromTemplate', '由此模板构建的应用详情')}</span>
            </div>
            <h3 className="text-xl font-bold text-white">{relatedApp.name}</h3>
            <p className="text-xs text-slate-300 line-clamp-2 max-w-xl">
              {relatedApp.description}
            </p>
          </div>
        </div>

        <Link
          to={`/app/${relatedApp.id}`}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer group"
        >
          <span>{t('templates.card.appDetails', '查看应用详情')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
