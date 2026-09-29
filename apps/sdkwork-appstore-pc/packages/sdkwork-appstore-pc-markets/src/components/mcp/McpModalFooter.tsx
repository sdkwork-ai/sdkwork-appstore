import React from 'react';
import { useTranslation } from 'react-i18next';

interface McpModalFooterProps {
  onClose: () => void;
}

export const McpModalFooter: React.FC<McpModalFooterProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-5 pt-4 border-t border-store-line-soft flex justify-end ">
      <button
        onClick={onClose}
        className="px-5 py-2 bg-store-subtle hover:bg-store-raised text-store-ink-soft rounded-store-control text-xs font-medium cursor-pointer transition-colors "
      >
        {t('common.actions.close')}
      </button>
    </div>
  );
};
