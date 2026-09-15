import { AlertTriangle, CheckCircle2 } from 'lucide-react';

/** Outcome tones for {@link CatalogFormNotice}. */
export type CatalogFormNoticeTone = 'success' | 'error';

const TONE_CLASSES: Record<CatalogFormNoticeTone, string> = {
  success:
    'border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300',
  error:
    'border-rose-200 bg-rose-50/70 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300',
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
