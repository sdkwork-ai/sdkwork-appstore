import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, GitFork, ExternalLink, Check, ArrowRight, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { TemplateItem } from '../../types';
import { TemplatesService } from '../../services/api';

interface TemplateModalFooterProps {
  template: TemplateItem;
  onClose: () => void;
}

export const TemplateModalFooter: React.FC<TemplateModalFooterProps> = ({
  template,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stars, setStars] = useState(template.stars);
  const [forks, setForks] = useState(template.forks);
  const [starred, setStarred] = useState(false);
  const [forked, setForked] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleStar = async () => {
    if (starred) return;
    const res = await TemplatesService.starTemplate(template.id);
    setStars(res.stars);
    setStarred(true);
  };

  const handleFork = async () => {
    setCreating(true);
    const res = await TemplatesService.forkTemplate(template.id);
    setForks(res.forks);
    setForked(true);
    setSuccessMsg(t('templates.modal.createdSuccess', { title: template.title }));
    setCreating(false);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  const handleGoToAppDetail = () => {
    onClose();
    const appId = template.relatedAppId || 'app-saas-starter';
    navigate(`/app/${appId}`);
  };

  return (
    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-[#262933] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3 text-xs font-medium">
        <button
          onClick={handleStar}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            starred
              ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-bold'
              : 'border-gray-200 dark:border-[#2a2d39] text-gray-600 dark:text-gray-300 hover:border-amber-500'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${starred ? 'fill-amber-500' : ''}`} />
          <span>{stars} Stars</span>
        </button>

        <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <GitFork className="w-3.5 h-3.5" />
          {forks} Forks
        </span>
      </div>

      <div className="flex items-center gap-2">
        {successMsg && (
          <span className="text-xs text-emerald-500 font-bold flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {successMsg}
          </span>
        )}

        <button
          onClick={handleGoToAppDetail}
          className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold border border-slate-700/60 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
          title={t('templates.modal.goToAppDetail')}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t('templates.modal.goToAppDetail')}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        <button
          onClick={handleFork}
          disabled={creating || forked}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {creating ? (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>{forked ? t('templates.modal.initSuccess') : t('templates.modal.createAppBtn')}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};


