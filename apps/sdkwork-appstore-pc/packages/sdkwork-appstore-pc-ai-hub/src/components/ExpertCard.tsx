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
      className="group relative flex flex-col justify-between bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl p-4 md:p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-0.5 select-none dark:bg-slate-900/90 dark:hover:bg-slate-850/90 dark:border-slate-800/90 dark:hover:border-slate-700/90"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar Icon */}
            <div
              className={`w-11 h-11 rounded-xl ${
                expert.avatarBg || 'bg-indigo-600'
              } flex items-center justify-center text-white shadow-md shrink-0 transition-transform group-hover:scale-105`}
            >
              <IconComponent className="w-5.5 h-5.5" />
            </div>

            {/* Title & Nickname */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate dark:text-slate-100 dark:group-hover:text-indigo-300">
                  {expert.name}
                </h4>
                {expert.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {expert.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                {expert.nickname}
              </p>
            </div>
          </div>

          {/* Add to My Experts Button */}
          <button
            type="button"
            title={isMyExpert ? t('aihub.experts.card.addedToMine') : t('aihub.experts.card.addToMine')}
            onClick={(e) => onToggleMyExpert(expert.id, e)}
            className={`p-1.5 rounded-xl border transition-all shrink-0 ${
              isMyExpert
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300 hover:bg-indigo-600/40'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-800/80 dark:border-slate-700/80 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700/80'
            }`}
          >
            {isMyExpert ? <Check className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Description Body */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 min-h-[2.25rem] mb-3.5">
          {expert.description}
        </p>
      </div>

      {/* Footer Tags & Actions */}
      <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800/60">
        {/* Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          {expert.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 group-hover:border-slate-600 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-500 font-mono">
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
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group-hover:translate-x-0.5 duration-200"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t('aihub.experts.card.chatWithExpert')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
