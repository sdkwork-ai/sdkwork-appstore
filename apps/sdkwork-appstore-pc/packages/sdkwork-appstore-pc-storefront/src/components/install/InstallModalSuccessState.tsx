import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

interface InstallModalSuccessStateProps {
  /** Absolute path of the saved installer, when the host reports one. */
  savedPath?: string | null;
}

/** Completed install body: the installer reached local storage and is ready to run. */
export const InstallModalSuccessState: React.FC<InstallModalSuccessStateProps> = ({
  savedPath,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-2 text-store-success"
    >
      <div className="w-12 h-12 bg-store-success-soft rounded-full flex items-center justify-center mb-2 ">
        <Check className="w-6 h-6" />
      </div>
      <span className="font-bold text-sm">{t('install.modal.completed')}</span>
      <p className="mt-2 text-[11px] font-medium text-store-ink-faint text-center">
        {savedPath
          ? t('install.modal.savedTo', { path: savedPath })
          : t('install.modal.runInstallerHint')}
      </p>
    </motion.div>
  );
};
