import React from 'react';
import { useTranslation } from 'react-i18next';

interface McpModalFooterProps {
  onClose: () => void;
}

export const McpModalFooter: React.FC<McpModalFooterProps> = ({ onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#262933] flex justify-end">
      <button
        onClick={onClose}
        className="px-5 py-2 bg-gray-100 dark:bg-[#22252e] hover:bg-gray-200 dark:hover:bg-[#2a2d39] text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
      >
        {t('common.actions.close')}
      </button>
    </div>
  );
};
