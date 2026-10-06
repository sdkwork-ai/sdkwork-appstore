import { useTranslation } from 'react-i18next';

/**
 * Status tones for catalog rows. The backend owns the enum and may add
 * variants; unknown tokens render as-is in a neutral tone instead of being
 * coerced into a wrong label.
 */
const STATUS_TONES: Record<string, string> = {
  ACTIVE: 'bg-store-success-soft text-store-success',
  PUBLISHED: 'bg-store-success-soft text-store-success',
  DRAFT: 'bg-store-info-soft text-store-info',
  SCHEDULED: 'bg-store-info-soft text-store-info',
  PAUSED: 'bg-store-warning-soft text-store-warning',
  INACTIVE: 'bg-store-warning-soft text-store-warning',
  ARCHIVED: 'bg-store-subtle text-store-ink-faint',
  EXPIRED: 'bg-store-subtle text-store-ink-faint',
};

/** Neutral tones for statuses the console does not know yet. */
const NEUTRAL_TONE = 'bg-store-subtle text-store-ink-faint';

function normalizeToken(status: string | undefined): string {
  return (status ?? '').trim().toLocaleUpperCase();
}

/**
 * Renders a lifecycle status of a category, collection, or featured slot.
 * Localization falls back to the normalized raw token when no translation
 * exists, so a new server-side status never shows a wrong label.
 */
export function CatalogStatusBadge({ status }: { status?: string }) {
  const { t } = useTranslation();
  const token = normalizeToken(status);
  if (!token) {
    return <span className="text-xs text-store-ink-faint">—</span>;
  }
  const tone = STATUS_TONES[token] ?? NEUTRAL_TONE;
  const translationKey = `adminCatalog.lifecycleStatus.${token}`;
  const label = t(translationKey, { defaultValue: token });
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}
