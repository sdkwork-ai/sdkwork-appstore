import React from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DemandClaimNoticeProps {
  /** Localized success copy; the caller owns when the notice clears. */
  message: string;
  onDismiss: () => void;
}

/**
 * Inline success notice shared by the demand hall list and the detail page.
 * It confirms a submitted claim without stealing focus or blocking the page,
 * and clears itself after the caller's timer.
 */
export const DemandClaimNotice: React.FC<DemandClaimNoticeProps> = ({ message, onDismiss }) => {
  const { t } = useTranslation();
  return (
    <div
      className="sticky top-2 z-10 flex items-center gap-2 rounded-store-card border border-store-brand/30 bg-store-surface/95 px-4 py-2.5 text-xs text-store-brand shadow-sm backdrop-blur-sm"
      role="status"
    >
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      <span className="min-w-0 flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={t('demands.claim.dismiss')}
        className="w-6 h-6 rounded-full flex items-center justify-center text-store-brand/70 hover:text-store-brand transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
