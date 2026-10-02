import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { DynamicIcon } from '../DynamicIcon';
import { AppItem } from '../../types';
import { InstallModalConfirmActions } from './InstallModalConfirmActions';
import { InstallModalProgress } from './InstallModalProgress';
import { InstallModalSuccessState } from './InstallModalSuccessState';

interface InstallModalProps {
  app: AppItem;
  installState: 'confirm' | 'downloading' | 'success';
  progress: number;
  error?: string | null;
  /** Desktop platform code the install records (windows/macos/linux); shown on confirm. */
  installPlatform?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function InstallModal({
  app,
  installState,
  progress,
  error,
  installPlatform,
  onConfirm,
  onCancel,
}: InstallModalProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-store-overlay backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-store-surface rounded-store-modal w-full max-w-sm p-6 shadow-2xl overflow-hidden border border-store-line-soft "
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${app.iconColor} dark:shadow-none`}
          >
            <DynamicIcon name={app.icon} className="text-white w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-store-ink ">{app.name}</h3>
          <p className="text-sm text-store-ink-faint mt-1 mb-6 ">{app.developer}</p>

          {error && (
            <p className="text-sm text-store-danger mb-4 " role="alert">
              {error}
            </p>
          )}

          {installState === 'confirm' && (
            <>
              {installPlatform && (
                <p className="text-xs font-medium text-store-ink-soft bg-store-subtle border border-store-line-soft rounded-full px-3 py-1 mb-4">
                  {t('install.modal.platformNote', {
                    platform: t(`common.distribution.os.${installPlatform}`),
                  })}
                </p>
              )}
              <InstallModalConfirmActions onConfirm={onConfirm} onCancel={onCancel} />
            </>
          )}

          {installState === 'downloading' && (
            <InstallModalProgress progress={progress} />
          )}

          {installState === 'success' && (
            <InstallModalSuccessState />
          )}
        </div>
      </motion.div>
    </div>
  );
}

