import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AISandboxMetricsBarProps {
  demoResponse: string;
  metrics: {
    tokenCount?: number;
    latencyMs?: number;
    modelUsed?: string;
  };
}

export const AISandboxMetricsBar: React.FC<AISandboxMetricsBarProps> = ({
  demoResponse,
  metrics,
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!demoResponse) return null;

  const handleCopy = () => {
    if (!demoResponse) return;
    navigator.clipboard.writeText(demoResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between text-[11px] text-store-ink-faint px-1 pt-1 ">
      <div className="flex items-center gap-3">
        <span>{t('aihub.sandbox.usedModel')}: <strong className="text-store-info ">{metrics.modelUsed}</strong></span>
        <span>{t('aihub.sandbox.latencyLabel')}: <strong>{metrics.latencyMs}ms</strong></span>
        <span>Tokens: <strong>{metrics.tokenCount}</strong></span>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-1 text-xs text-store-ink-soft hover:text-store-info font-medium cursor-pointer transition-colors "
      >
        {copied ? <Check className="w-3.5 h-3.5 text-store-success" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? t('common.actions.copied') : t('aihub.sandbox.copyResponse')}</span>
      </button>
    </div>
  );
};
