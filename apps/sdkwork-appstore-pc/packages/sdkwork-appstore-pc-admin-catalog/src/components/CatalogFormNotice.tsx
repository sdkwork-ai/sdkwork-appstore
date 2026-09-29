import { AlertTriangle, CheckCircle2 } from 'lucide-react';

/** Outcome tones for {@link CatalogFormNotice}. */
export type CatalogFormNoticeTone = 'success' | 'error';

const TONE_CLASSES: Record<CatalogFormNoticeTone, string> = {
  success:
    'border-store-success-soft bg-store-success-soft text-store-success   ',
  error:
    'border-store-danger-soft bg-store-danger-soft text-store-danger   ',
};

export interface CatalogFormNoticeProps {
  /** Localized copy resolved by the owning form from its fragment. */
  message: string;
  tone: CatalogFormNoticeTone;
}

/**
 * Result banner rendered next to a catalog form's submit button.
 *
 * It carries the form's own validation copy and the localized success
 * confirmation, so the operator always reads the outcome where the write was
 * triggered. Backend failures keep using `AdminCommandError`, which presents the
 * normalized error kind rather than transport copy.
 */
export function CatalogFormNotice({ message, tone }: CatalogFormNoticeProps) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertTriangle;
  return (
    <p
      role={tone === 'success' ? 'status' : 'alert'}
      className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${TONE_CLASSES[tone]}`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}
