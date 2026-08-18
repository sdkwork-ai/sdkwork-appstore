import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../../types';
import { DynamicIcon } from '../DynamicIcon';
import { useInstall } from '../../providers/InstallProvider';

interface AppRecommendationCardProps {
  app: AppItem;
  score: number;
}

export const AppRecommendationCard: React.FC<AppRecommendationCardProps> = ({ app, score }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { installApp, openApp, isInstalled } = useInstall();
  const matchPercent = Math.min(99, Math.max(88, Math.round(88 + (score / 100) * 11)));
  const installed = isInstalled(app.id);

  return (
    <div
      onClick={() => navigate(`/app/${app.id}`)}
      className="group p-3.5 bg-gray-100/60 dark:bg-[#1C1C1E] border border-gray-200/80 dark:border-[#2C2C2E] hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl cursor-pointer transition-all duration-200 hover:shadow-md relative overflow-hidden flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${app.iconColor}`}>
              <DynamicIcon name={app.icon} className="text-white w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs md:text-sm text-[#1C1C1E] dark:text-[#F5F5F5] truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {app.name}
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {app.category} · ★ {app.rating}
              </p>
            </div>
          </div>

          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            {t('appDetail.recommendations.matchPercent', { percent: matchPercent })}
          </span>
        </div>

        <p className="text-[11px] text-gray-600 dark:text-gray-300 line-clamp-2 mt-2.5 leading-relaxed">
          {app.description}
        </p>
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-200/60 dark:border-[#28282A] flex items-center justify-between">
        <span className="text-[10px] text-gray-400 font-medium">
          {app.reviewsCount > 100000 
            ? t('appDetail.recommendations.playersTenThousand', { count: (app.reviewsCount / 10000).toFixed(1) })
            : t('appDetail.recommendations.playersExact', { count: app.reviewsCount })}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (installed) {
              openApp(app);
            } else {
              installApp(app);
            }
          }}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
            installed
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          {installed ? t('appDetail.recommendations.open') : t('appDetail.recommendations.get')}
        </button>
      </div>
    </div>
  );
};

