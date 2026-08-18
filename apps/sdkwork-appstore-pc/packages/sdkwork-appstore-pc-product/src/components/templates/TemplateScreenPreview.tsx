import React from 'react';
import { ExternalLink, Layers, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TemplateScreenPreviewProps {
  previewImage?: string;
  screenshots?: string[];
  title: string;
  category: string;
  framework: string;
  isOfficial?: boolean;
}

export const TemplateScreenPreview: React.FC<TemplateScreenPreviewProps> = ({
  previewImage,
  screenshots,
  title,
  category,
  framework,
}) => {
  const { t } = useTranslation();

  const defaultFallbackImage =
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80';

  const imageSrc = previewImage || (screenshots && screenshots[0]) || defaultFallbackImage;
  const count = screenshots && screenshots.length > 0 ? screenshots.length : 3;

  return (
    <div className="relative group/screen rounded-xl overflow-hidden border border-gray-200/80 dark:border-[#2a2d39] bg-slate-900 shadow-sm transition-all duration-300 my-3">
      <div className="h-6 px-3 bg-gray-100 dark:bg-[#20232c] border-b border-gray-200 dark:border-[#2a2d39] flex items-center justify-between text-[10px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2 h-2 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2 h-2 rounded-full bg-emerald-500/80 inline-block" />
        </div>
        <div className="px-2 py-0.5 rounded bg-white/60 dark:bg-black/40 text-gray-600 dark:text-gray-300 font-mono text-[9px] truncate max-w-[180px]">
          {title.toLowerCase().replace(/\s+/g, '-')}.app
        </div>
        <div className="flex items-center gap-1 text-[9px] text-indigo-500 font-semibold">
          <Layers className="w-2.5 h-2.5" />
          <span>{t('templates.detail.screenPreview.uiPreview')}</span>
        </div>
      </div>

      <div className="relative h-36 w-full overflow-hidden bg-slate-950">
        <img
          src={imageSrc}
          alt={`${title} Preview`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover/screen:scale-105 group-hover/screen:brightness-105"
        />

        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] text-white/90 font-medium flex items-center gap-1 border border-white/10 shadow-sm">
          <ImageIcon className="w-3 h-3 text-indigo-400" />
          <span>{t('templates.detail.screenPreview.screenshotCount', { count })}</span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover/screen:opacity-90 transition-opacity" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/screen:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
          <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs shadow-lg flex items-center gap-1.5 scale-90 group-hover/screen:scale-100 transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('templates.detail.screenPreview.enterDetail')}</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white/90">
          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 font-medium">
            {category}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/80 backdrop-blur-md font-mono text-[9px] text-white">
            {framework.split('+')[0].trim()}
          </span>
        </div>
      </div>
    </div>
  );
};
