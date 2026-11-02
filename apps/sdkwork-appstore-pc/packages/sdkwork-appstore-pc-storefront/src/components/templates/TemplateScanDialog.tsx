import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCodeImage } from '@sdkwork/appstore-pc-commons';
import { resolveTemplateAppType } from '@sdkwork/appstore-pc-core';
import { ArrowUpRight, Smartphone, X } from 'lucide-react';
import type { TemplateItem } from '../../types';
import { isHttpUrl, type TemplateScanTarget } from '../../lib/templateScan';

interface TemplateScanDialogProps {
  template: TemplateItem;
  target: TemplateScanTarget;
  onClose: () => void;
}

/**
 * Scan-to-try dialog for templates whose app form runs on a phone (H5, mini
 * program, Flutter/native mobile, uni-app). Encodes the resolved experience
 * URL so the reader can continue on the device that actually runs the app.
 *
 * Lifecycle: moving focus into the dialog and restoring it on close keeps
 * keyboard readers anchored to the trigger, and Escape dismisses the dialog the
 * same way the backdrop does.
 */
export function TemplateScanDialog({ template, target, onClose }: TemplateScanDialogProps) {
  const { t } = useTranslation();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const appType = resolveTemplateAppType(template.platform);
  const sourceCaption =
    target.source === 'demo'
      ? t('templates.detail.scanSourceDemo')
      : t('templates.detail.scanSourceApp');

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('templates.detail.scanTitle')}
      data-template-scan-dialog={template.id}
    >
      <div className="absolute inset-0 bg-store-overlay backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-store-surface rounded-store-modal w-full max-w-xs p-6 shadow-2xl border border-store-line-soft text-center">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={t('common.accessibility.closeModal')}
          className="absolute top-4 right-4 p-1.5 text-store-ink-faint hover:text-store-ink rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className={`w-16 h-16 rounded-store-card flex items-center justify-center mx-auto mb-3 shadow-lg ${template.iconColor}`}
        >
          <Smartphone className="text-white w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-store-ink">{template.title}</h3>
        <p className="text-xs font-medium text-store-ink-soft mt-0.5">
          {appType ? t(`templates.platforms.${appType.labelKey}`) : template.platform}
        </p>
        <p className="text-xs text-store-ink-faint mt-0.5">
          {t('templates.detail.scanTitle')}
        </p>

        <div className="mt-4 flex justify-center" data-template-scan-qr={target.url}>
          <QrCodeImage value={target.url} size={176} />
        </div>

        <p className="text-xs text-store-ink-faint mt-3 leading-relaxed">
          {t('templates.detail.scanHint')}
        </p>
        <p className="mt-1 text-[10px] text-store-ink-faint/80">{sourceCaption}</p>
        {isHttpUrl(target.url) ? (
          <a
            href={target.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-1 text-[11px] font-medium text-store-brand hover:underline break-all"
          >
            {target.url}
            <ArrowUpRight className="w-3 h-3 shrink-0" />
          </a>
        ) : (
          <p className="mt-3 text-[11px] font-medium text-store-ink-soft break-all">{target.url}</p>
        )}
      </div>
    </div>
  );
}
