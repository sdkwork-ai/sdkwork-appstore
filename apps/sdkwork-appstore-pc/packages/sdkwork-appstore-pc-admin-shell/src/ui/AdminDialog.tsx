import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export interface AdminDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  /** Right-aligned command area, typically cancel + submit. */
  footer?: ReactNode;
  /** Panel width preset. `lg` suits decision forms with reason fields. */
  size?: 'md' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<AdminDialogProps['size']>, string> = {
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Operator modal for commands that need additional input (decisions, appeals,
 * catalog authoring). Closes on Escape and on overlay click; the caller owns
 * the command state and any in-flight guard.
 */
export function AdminDialog({
  children,
  description,
  footer,
  onClose,
  open,
  size = 'md',
  title,
}: AdminDialogProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${SIZE_CLASSES[size]} rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-[#22252e] dark:bg-[#14161c]`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-[#1f232c]">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('adminShell.common.close')}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#1d2028]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3 dark:border-[#1f232c]">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
