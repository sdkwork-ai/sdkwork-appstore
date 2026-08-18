import React from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';

export const InstallModalSuccessState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center py-2 text-green-500"
    >
      <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-2">
        <Check className="w-6 h-6" />
      </div>
      <span className="font-bold text-sm">{t('install.modal.completed')}</span>
    </motion.div>
  );
};
