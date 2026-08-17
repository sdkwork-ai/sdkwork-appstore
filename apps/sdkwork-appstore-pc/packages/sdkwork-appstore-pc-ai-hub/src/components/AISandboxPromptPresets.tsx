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
      <span className="text-[11px] text-gray-400 font-medium py-0.5">{t('aihub.sandbox.presetsLabel')}</span>
      {presets.map((preset, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelectPreset(preset)}
          className="text-[11px] px-2.5 py-0.5 rounded-lg bg-gray-200/60 dark:bg-[#222530] hover:bg-teal-500/15 hover:text-teal-600 dark:hover:text-teal-400 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
        >
          {preset}
        </button>
      ))}
    </div>
  );
};
