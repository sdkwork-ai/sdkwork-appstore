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
      <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 shrink-0">
        <Cpu className="w-3.5 h-3.5 text-teal-500" />
        {t('aihub.sandbox.testEngine')}
      </span>
      <select
        value={selectedModelId}
        onChange={(e) => onModelChange(e.target.value)}
        className="bg-white dark:bg-[#20232b] text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-[#2d313c] rounded-lg text-xs px-2 py-1 outline-none focus:border-teal-500 font-medium cursor-pointer"
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
