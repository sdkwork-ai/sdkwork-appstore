import React from 'react';
import { useTranslation } from 'react-i18next';

interface InstallModalConfirmActionsProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const InstallModalConfirmActions: React.FC<InstallModalConfirmActionsProps> = ({
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  return (
    <div className="w-full flex gap-3">
      <button
        onClick={onCancel}
        className="flex-1 py-3 bg-gray-100 dark:bg-[#2C2C2E] hover:bg-gray-200 dark:hover:bg-[#3C3C3E] text-[#1C1C1E] dark:text-[#F5F5F5] font-bold rounded-xl transition-colors cursor-pointer"
      >
        {t('common.actions.cancel')}
      </button>
      <button
        onClick={onConfirm}
        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md shadow-blue-200 dark:shadow-none cursor-pointer"
      >
        {t('common.actions.install')}
      </button>
    </div>
  );
};
