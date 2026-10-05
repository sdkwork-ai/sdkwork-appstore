import React from 'react';
import { useTranslation } from 'react-i18next';
import { TEMPLATE_PLATFORMS, type TemplatePlatform } from '@sdkwork/appstore-pc-core';

/** Filter-row label key per platform code (templates.platforms.*). */
const PLATFORM_LABEL_KEYS: Record<TemplatePlatform, 'h5' | 'pc' | 'flutter' | 'miniprogram'> = {
  H5: 'h5',
  PC: 'pc',
  FLUTTER: 'flutter',
  MINIPROGRAM: 'miniprogram',
};

interface TemplatesPlatformFilterProps {
  /** Selected platform code; '' shows every template. */
  selected: string;
  onSelect: (platform: string) => void;
}

/**
 * Template target-platform pill row (All / H5 / PC / Flutter / mini program).
 * Sits beside the category filter; the selection is sent to the catalog as a
 * server-side `template_platform` filter. Unknown codes stored on templates
 * render verbatim and filter exactly by their code.
 */
export const TemplatesPlatformFilter: React.FC<TemplatesPlatformFilterProps> = ({
  selected,
  onSelect,
}) => {
  const { t } = useTranslation();

  const getPlatformLabel = (platform: string) => {
    const key = PLATFORM_LABEL_KEYS[platform as TemplatePlatform];
    return key ? t(`templates.platforms.${key}`) : platform;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar" data-templates-platform-filter>
      <button
        onClick={() => onSelect('')}
        className={`px-3.5 py-1.5 rounded-store-control text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
          selected === ''
            ? 'bg-store-brand text-white shadow-sm'
            : 'bg-store-surface text-store-ink-soft border border-store-line hover:bg-store-subtle '
        }`}
      >
        {t('templates.platforms.all')}
      </button>
      {TEMPLATE_PLATFORMS.map((platform) => (
        <button
          key={platform}
          onClick={() => onSelect(platform)}
          className={`px-3.5 py-1.5 rounded-store-control text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
            selected === platform
              ? 'bg-store-brand text-white shadow-sm'
              : 'bg-store-surface text-store-ink-soft border border-store-line hover:bg-store-subtle '
          }`}
        >
          {getPlatformLabel(platform)}
        </button>
      ))}
    </div>
  );
};

export default TemplatesPlatformFilter;
