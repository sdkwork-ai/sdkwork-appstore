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
    <div className="p-6 md:p-8 rounded-store-card bg-store-surface border border-store-line/80 dark:border-store-line shadow-sm relative overflow-hidden ">
      {/* Decorative Background Blob */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-store-brand/10 dark:bg-store-brand/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 relative z-10">
        {/* Left: Icon & Info */}
        <div className="flex flex-col sm:flex-row items-start gap-5 flex-1">
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 rounded-store-card ${
              template.iconColor || 'bg-store-brand'
            } flex items-center justify-center text-white shadow-md shrink-0`}
          >
            <DynamicIcon name={template.icon || 'Boxes'} className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-store-brand-soft dark:bg-store-brand/60 text-store-brand text-xs font-medium border border-store-brand-soft dark:border-store-brand/50 ">
                {template.category}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-store-subtle text-store-ink-soft text-xs font-medium ">
                {template.framework}
              </span>
              {template.isOfficial && (
                <span className="px-2.5 py-0.5 rounded-full bg-store-warning/10 text-store-warning text-xs font-medium border border-store-warning/20 flex items-center gap-1 ">
                  <Sparkles className="w-3 h-3" />
                  {t('templates.card.officialRec', '官方推荐')}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-store-ink tracking-tight ">
              {template.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-store-ink-faint ">
              <span className="flex items-center gap-1.5 font-medium text-store-ink-soft ">
                <User className="w-3.5 h-3.5 text-store-brand" />
                {template.author}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-store-warning">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {starsCount} Stars
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium">
                <GitFork className="w-3.5 h-3.5 text-store-brand" />
                {forksCount} Forks
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {t('templates.detail.publishedAt', { date: template.publishedAt || t('common.time.recently', '最近'), defaultValue: `发布于 ${template.publishedAt || '最近'}` })}
              </span>
            </div>

            <p className="text-sm text-store-ink-soft dark:text-slate-300 leading-relaxed pt-1 max-w-2xl ">
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
      <div className="mt-6 pt-5 border-t border-store-line-soft flex flex-wrap items-center gap-2 ">
        <span className="text-xs text-store-ink-faint font-medium mr-1">{t('templates.detail.keyTech', '关键技术:')}</span>
        {template.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-2.5 py-0.5 rounded-full bg-store-subtle text-store-ink-soft text-xs font-mono border border-store-line/60 font-medium"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};
