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
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-store-overlay p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full ${SIZE_CLASSES[size]} rounded-store-modal border border-store-line bg-store-surface shadow-xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-store-line-soft px-4 py-3 ">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-store-ink ">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-xs text-store-ink-faint ">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('adminShell.common.close')}
            className="rounded-store-control p-1 text-store-ink-faint transition-colors hover:bg-store-subtle hover:text-store-ink-soft text-xs font-medium"
          >
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="max-h-[70vh] overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <footer className="flex items-center justify-end gap-2 border-t border-store-line-soft px-4 py-3 ">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
