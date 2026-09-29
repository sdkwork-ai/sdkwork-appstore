import React from 'react';
import { useTranslation } from 'react-i18next';

interface AISandboxPromptPresetsProps {
  onSelectPreset: (presetText: string) => void;
}

export const AISandboxPromptPresets: React.FC<AISandboxPromptPresetsProps> = ({
  onSelectPreset
}) => {
  const { t } = useTranslation();

  const presets = [
    t('aihub.sandbox.presets.p1'),
    t('aihub.sandbox.presets.p2'),
    t('aihub.sandbox.presets.p3'),
    t('aihub.sandbox.presets.p4')
  ];

  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      <span className="text-[11px] text-store-ink-faint font-medium py-0.5">{t('aihub.sandbox.presetsLabel')}</span>
      {presets.map((preset, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectPreset(preset)}
          className="text-xs px-2.5 py-0.5 rounded-store-control bg-store-raised/60 dark:bg-store-surface hover:bg-store-info/15 hover:text-store-info text-store-ink-soft transition-colors cursor-pointer font-medium"
        >
          {preset}
        </button>
      ))}
    </div>
  );
};
