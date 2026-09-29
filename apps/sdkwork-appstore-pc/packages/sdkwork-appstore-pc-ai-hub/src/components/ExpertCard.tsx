import React from 'react';
import { useTranslation as useI18n } from 'react-i18next';
import {
  Code,
  Smartphone,
  MessageSquare,
  Utensils,
  Search,
  Briefcase,
  Zap,
  Layout,
  Compass,
  FileText,
  Gamepad2,
  Award,
  Video,
  DollarSign,
  CheckSquare,
  Heart,
  Layers,
  Shield,
  UserCheck,
  BookOpen,
  Cpu,
  Terminal,
  Target,
  Globe,
  GraduationCap,
  FileCode,
  TrendingUp,
  ShieldCheck,
  Users,
  PenTool,
  Palette,
  LineChart,
  MessageCircle,
  Plus,
  Check,
  Sparkles
} from 'lucide-react';
import { ExpertItem } from '@sdkwork/appstore-pc-core';

interface ExpertCardProps {
  expert: ExpertItem;
  isMyExpert: boolean;
  onToggleMyExpert: (expertId: string, e: React.MouseEvent) => void;
  onClickCard: (expert: ExpertItem) => void;
  onOpenSandboxChat?: (expert: ExpertItem, e: React.MouseEvent) => void;
}

const iconMap: Record<string, React.ElementType> = {
  Code,
  Smartphone,
  MessageSquare,
  Utensils,
  Search,
  Briefcase,
  Zap,
  Layout,
  Compass,
  FileText,
  Gamepad2,
  Award,
  Video,
  DollarSign,
  CheckSquare,
  Heart,
  Layers,
  Shield,
  UserCheck,
  BookOpen,
  Cpu,
  Terminal,
  Target,
  Globe,
  GraduationCap,
  FileCode,
  TrendingUp,
  ShieldCheck,
  Users,
  PenTool,
  Palette,
  LineChart
};

export const ExpertCard: React.FC<ExpertCardProps> = ({
  expert,
  isMyExpert,
  onToggleMyExpert,
  onClickCard,
  onOpenSandboxChat
}) => {
  const { t } = useI18n();
  const IconComponent = (expert.avatarIcon && iconMap[expert.avatarIcon]) || Sparkles;

  return (
    <div
      onClick={() => onClickCard(expert)}
      className="group relative flex flex-col justify-between bg-store-surface hover:bg-store-subtle border border-store-line hover:border-store-line-strong rounded-store-card p-4 md:p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-store-brand/5 hover:-translate-y-0.5 select-none dark:bg-slate-900/90 dark:hover:bg-slate-850/90 dark:border-store-line/90 dark:hover:border-store-line/90"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Icon */}
            <div
              className={`w-11 h-11 rounded-store-control ${
                expert.avatarBg || 'bg-store-brand'
              } flex items-center justify-center text-white shadow-md shrink-0 transition-transform group-hover:scale-105`}
            >
              <IconComponent className="w-5.5 h-5.5" />
            </div>

            {/* Title & Nickname */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-store-ink group-hover:text-store-brand transition-colors truncate  ">
                  {expert.name}
                </h4>
                {expert.badge && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-store-warning/20 text-store-warning border border-store-warning/30">
                    {expert.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-store-ink-faint font-medium truncate mt-0.5 ">
                {expert.nickname}
              </p>
            </div>
          </div>

          {/* Add to My Experts Button */}
          <button
            type="button"
            title={isMyExpert ? t('aihub.experts.card.addedToMine') : t('aihub.experts.card.addToMine')}
            onClick={(e) => onToggleMyExpert(expert.id, e)}
            className={`p-1.5 rounded-store-control border transition-all shrink-0 text-xs font-medium${
              isMyExpert
                ? 'bg-store-brand/30 border-store-brand text-store-brand hover:bg-store-brand/40'
                : 'bg-store-subtle border-store-line text-store-ink-faint hover:text-store-ink hover:bg-store-raised dark:bg-slate-800/80 dark:border-store-line/80 dark:hover:bg-slate-700/80 '
            }`}
          >
            {isMyExpert ? <Check className="w-4 h-4 text-store-brand" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Description Body */}
        <p className="text-xs text-store-ink-soft leading-relaxed line-clamp-2 min-h-[2.25rem] mb-3.5 ">
          {expert.description}
        </p>
      </div>

      {/* Footer Tags & Actions */}
      <div className="space-y-3 pt-2 border-t border-store-line dark:border-store-line/60">
        {/* Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {expert.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-store-line/60 group-hover:border-slate-600 transition-colors font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-store-ink-faint font-mono">
            {t('aihub.experts.card.callsCount', {
              rating: expert.rating.toFixed(1),
              calls: (expert.popularity / 1000).toFixed(1),
            })}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenSandboxChat) {
                onOpenSandboxChat(expert, e);
              } else {
                onClickCard(expert);
              }
            }}
            className="flex items-center gap-1 text-xs font-semibold text-store-brand hover:text-store-brand transition-colors group-hover:translate-x-0.5 duration-200"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t('aihub.experts.card.chatWithExpert')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
