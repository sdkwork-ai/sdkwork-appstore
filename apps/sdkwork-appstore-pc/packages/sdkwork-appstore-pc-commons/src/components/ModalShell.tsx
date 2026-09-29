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

/**
 * The shared dialog frame. Every colour comes from the semantic tokens in
 * `apps/sdkwork-appstore-pc/src/index.css`, so a dialog opened from any page
 * renders on the same surface, border and radius.
 */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-store-overlay backdrop-blur-sm animate-fade-in select-none">
      <div className={`relative w-full ${maxWidthClass} bg-store-surface border border-store-line rounded-store-modal shadow-2xl overflow-hidden p-6 text-store-ink`}>
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={t('common.accessibility.closeModal')}
          className="absolute top-5 right-5 p-2 text-store-ink-faint hover:text-store-ink bg-store-subtle hover:bg-store-raised rounded-full transition-colors cursor-pointer text-xs font-medium"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Optional Header Header Block */}
        {(title || icon) && (
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div className="w-10 h-10 rounded-store-control bg-store-brand text-store-on-brand flex items-center justify-center shadow-md shrink-0">
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
                <p className="text-xs text-store-ink-faint">{subtitle}</p>
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
