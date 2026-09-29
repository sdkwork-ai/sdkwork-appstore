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
    <div className="flex items-center justify-between bg-store-brand/60 border border-store-brand/60 px-4 py-2.5 rounded-store-control text-xs text-store-brand">
      <span className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-store-brand" />
        {t('aihub.sandbox.testingWith', { name: activeExpertName })}
      </span>
      <button
        type="button"
        onClick={onResetContext}
        className="text-store-brand hover:text-store-brand underline cursor-pointer"
      >
        {t('aihub.sandbox.resetContext')}
      </button>
    </div>
  );
};
