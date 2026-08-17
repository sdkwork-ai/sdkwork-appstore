import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

interface AISandboxContextBannerProps {
  activeExpertName: string;
  onResetContext: () => void;
}

export const AISandboxContextBanner: React.FC<AISandboxContextBannerProps> = ({
  activeExpertName,
  onResetContext,
}) => {
  const { t } = useTranslation();

  if (!activeExpertName) return null;

  return (
    <div className="flex items-center justify-between bg-indigo-950/60 border border-indigo-800/60 px-4 py-2.5 rounded-xl text-xs text-indigo-200">
      <span className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        {t('aihub.sandbox.testingWith', { name: activeExpertName })}
      </span>
      <button
        type="button"
        onClick={onResetContext}
        className="text-indigo-400 hover:text-indigo-200 underline cursor-pointer"
      >
        {t('aihub.sandbox.resetContext')}
      </button>
    </div>
  );
};
