import React from 'react';
import { Cpu } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AIModelInfo } from '@sdkwork/appstore-pc-core';

interface AISandboxModelSelectorProps {
  models: AIModelInfo[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

export const AISandboxModelSelector: React.FC<AISandboxModelSelectorProps> = ({
  models,
  selectedModelId,
  onModelChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
      <span className="text-[11px] text-store-ink-faint font-medium flex items-center gap-1 shrink-0 ">
        <Cpu className="w-3.5 h-3.5 text-store-info" />
        {t('aihub.sandbox.testEngine')}
      </span>
      <select
        value={selectedModelId}
        onChange={(e) => onModelChange(e.target.value)}
        className="bg-store-field text-store-ink border border-store-line rounded-store-control text-sm px-3 outline-none focus:border-store-brand font-medium cursor-pointer h-9 placeholder:text-store-ink-faint transition-colors focus:ring-2 focus:ring-store-brand/25"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name} ({m.provider})
          </option>
        ))}
      </select>
    </div>
  );
};
