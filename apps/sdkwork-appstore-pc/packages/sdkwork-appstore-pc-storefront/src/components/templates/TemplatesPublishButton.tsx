import React from 'react';
import { UploadCloud } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/**
 * The 发布应用为模板 action. The templates page renders it inline on the
 * platform-filter row, or portals it into an embedding host's toolbar slot
 * (publishSlotSelector) with identical classes and copy.
 */
export const TemplatesPublishButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-store-control bg-store-brand hover:bg-store-brand text-white text-xs font-medium shadow-md transition-all cursor-pointer shrink-0"
    >
      <UploadCloud className="w-4 h-4" />
      <span>{t('templates.publishBtn')}</span>
    </button>
  );
};
