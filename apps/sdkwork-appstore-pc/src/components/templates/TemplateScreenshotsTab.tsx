import React, { useState } from 'react';
import { Monitor, Smartphone, ZoomIn, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TemplateScreenshotsTabProps {
  screenshots?: string[];
  title: string;
}

export const TemplateScreenshotsTab: React.FC<TemplateScreenshotsTabProps> = ({
  screenshots = [],
  title,
}) => {
  const { t } = useTranslation();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const list =
    screenshots.length > 0
      ? screenshots
      : [
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        ];

  const currentScreenshot = list[selectedIdx] || list[0];

  return (
    <div className="space-y-3 animate-fade-in text-xs">
      <div className="flex items-center justify-between bg-gray-50 dark:bg-[#20232d] p-2 rounded-xl border border-gray-200/60 dark:border-[#2a2d39]">
        <div className="flex items-center gap-1.5 text-gray-500 font-medium">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
          <span>
            {t('templates.detail.screenshots.previewTitle', {
              current: selectedIdx + 1,
              total: list.length,
            })}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white dark:bg-[#181a21] p-0.5 rounded-lg border border-gray-200 dark:border-[#2a2d39]">
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
              deviceMode === 'desktop'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>{t('templates.detail.screenshots.desktop')}</span>
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
              deviceMode === 'mobile'
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>{t('templates.detail.screenshots.mobile')}</span>
          </button>
        </div>
      </div>

      <div className="flex justify-center items-center py-2 bg-slate-950 rounded-2xl p-3 border border-slate-800 shadow-inner overflow-hidden">
        <div
          className={`relative transition-all duration-300 rounded-xl overflow-hidden border border-slate-700 shadow-2xl bg-slate-900 group ${
            deviceMode === 'mobile' ? 'w-[280px] h-[480px]' : 'w-full max-w-3xl h-[340px]'
          }`}
        >
          <div className="h-6 px-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[10px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </div>
            <span className="font-mono text-[9px] text-slate-400">
              {deviceMode === 'desktop' ? 'app.preview.local' : 'm.preview.local'}
            </span>
            <button
              onClick={() => setLightboxOpen(true)}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[9px]"
            >
              <ZoomIn className="w-3 h-3 text-indigo-400" />
              <span>{t('templates.detail.screenshots.zoom')}</span>
            </button>
          </div>

          <img
            src={currentScreenshot}
            alt={`${title} screenshot`}
            referrerPolicy="no-referrer"
            className="w-full h-[calc(100%-24px)] object-cover object-top"
          />
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
        {list.map((src, i) => (
          <button
            key={i}
            onClick={() => setSelectedIdx(i)}
            className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all cursor-pointer ${
              selectedIdx === i
                ? 'border-indigo-600 scale-105 shadow-md'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img src={src} alt="thumb" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {lightboxOpen && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
        >
          <div className="max-w-5xl max-h-[90vh] relative">
            <img
              src={currentScreenshot}
              alt="Full view"
              referrerPolicy="no-referrer"
              className="rounded-2xl shadow-2xl border border-white/20 max-h-[85vh] object-contain"
            />
            <div className="text-center text-white/80 text-xs font-medium mt-2">
              {t('templates.detail.screenshots.lightboxHint')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
