import { motion } from 'motion/react';
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
  onConfirm: () => void;
  onCancel: () => void;
}

export function InstallModal({
  app,
  installState,
  progress,
  error,
  onConfirm,
  onCancel,
}: InstallModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-white dark:bg-[#1C1C1E] rounded-3xl w-full max-w-sm p-6 shadow-2xl overflow-hidden border border-gray-100 dark:border-[#2C2C2E]"
      >
        <div className="flex flex-col items-center text-center">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg ${app.iconColor} dark:shadow-none`}
          >
            <DynamicIcon name={app.icon} className="text-white w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-[#1C1C1E] dark:text-[#F5F5F5]">{app.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">{app.developer}</p>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 mb-4" role="alert">
              {error}
            </p>
          )}

          {installState === 'confirm' && (
            <InstallModalConfirmActions onConfirm={onConfirm} onCancel={onCancel} />
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

