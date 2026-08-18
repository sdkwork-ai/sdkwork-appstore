import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  User,
  Star,
  GitFork,
  Calendar,
} from 'lucide-react';
import { TemplateItem, AppItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';
import { TemplateDetailActionButtons } from './TemplateDetailActionButtons';

interface TemplateDetailHeaderCardProps {
  template: TemplateItem;
  relatedApp: AppItem | null;
  starsCount: number;
  forksCount: number;
  starred: boolean;
  forking: boolean;
  forkedSuccess: boolean;
  copiedCli: boolean;
  onFork: () => void;
  onStar: () => void;
  onCopyCli: () => void;
}

export const TemplateDetailHeaderCard: React.FC<TemplateDetailHeaderCardProps> = ({
  template,
  relatedApp,
  starsCount,
  forksCount,
  starred,
  forking,
  forkedSuccess,
  copiedCli,
  onFork,
  onStar,
  onCopyCli,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#181a20] border border-gray-200/80 dark:border-[#262933] shadow-sm relative overflow-hidden">
      {/* Decorative Background Blob */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
        {/* Left: Icon & Info */}
        <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ${
              template.iconColor || 'bg-indigo-600'
            } flex items-center justify-center text-white shadow-md shrink-0`}
          >
            <DynamicIcon name={template.icon || 'Boxes'} className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-900/50">
                {template.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                {template.framework}
              </span>
              {template.isOfficial && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t('templates.card.officialRec', '官方推荐')}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              {template.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                {template.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {starsCount} Stars
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <GitFork className="w-3.5 h-3.5 text-blue-500" />
                {forksCount} Forks
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {t('templates.detail.publishedAt', { date: template.publishedAt || t('common.time.recently', '最近'), defaultValue: `发布于 ${template.publishedAt || '最近'}` })}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed pt-1 max-w-2xl">
              {template.description}
            </p>
          </div>
        </div>

        {/* Right Action Buttons Subcomponent */}
        <TemplateDetailActionButtons
          relatedApp={relatedApp}
          starred={starred}
          forking={forking}
          forkedSuccess={forkedSuccess}
          copiedCli={copiedCli}
          onFork={onFork}
          onStar={onStar}
          onCopyCli={onCopyCli}
        />
      </div>

      {/* Tags row */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-[#262933] flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-medium mr-1">{t('templates.detail.keyTech', '关键技术:')}</span>
        {template.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#20232d] text-slate-700 dark:text-slate-300 text-xs font-mono border border-slate-200/60 dark:border-slate-800/60"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};
