import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ModalShellProps {
  isOpen?: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen = true,
  onClose,
  title,
  subtitle,
  icon,
  maxWidthClass = 'max-w-xl',
  children,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className={`relative w-full ${maxWidthClass} bg-white dark:bg-[#181a20] border border-gray-200 dark:border-[#262933] rounded-3xl shadow-2xl overflow-hidden p-6 text-gray-900 dark:text-gray-100`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={t('common.accessibility.closeModal')}
          className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-[#222530] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Optional Header Header Block */}
        {(title || icon) && (
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                {icon}
              </div>
            )}
            <div>
              {title && typeof title === 'string' ? (
                <h2 className="text-lg font-bold">{title}</h2>
              ) : (
                title
              )}
              {subtitle && (
                <p className="text-xs text-gray-400">{subtitle}</p>
              )}
            </div>
          </div>
        )}

        {/* Main Body */}
        {children}
      </div>
    </div>
  );
};
