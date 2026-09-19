import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppItem } from '../types';
import { DynamicIcon } from './DynamicIcon';

interface HeroCarouselAppItemProps {
  app: AppItem;
  onInstall: (app: AppItem) => void;
}

export const HeroCarouselAppItem: React.FC<HeroCarouselAppItemProps> = ({ app, onInstall }) => {
  const { t } = useTranslation();

  return (
    <Link to={`/app/${app.id}`} className="flex items-center gap-4 group/app">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${app.iconColor} dark:shadow-none`}>
        <DynamicIcon name={app.icon} className="text-white w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm text-white group-hover/app:underline decoration-white/30 underline-offset-2">{app.name}</h3>
        <p className="text-xs text-white/70">{app.category}</p>
      </div>
      <button 
        className="text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-md transition-colors cursor-pointer shrink-0"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onInstall(app); }}
      >
        {t('common.actions.install')}
      </button>
    </Link>
  );
};
