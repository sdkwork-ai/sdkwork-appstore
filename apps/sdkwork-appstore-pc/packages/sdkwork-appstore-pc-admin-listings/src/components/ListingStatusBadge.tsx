import { useTranslation } from 'react-i18next';
import { AdminStatusBadge, type AdminStatusTone } from '@sdkwork/appstore-pc-admin-shell';

const LISTING_STATUS_TONES: Record<string, AdminStatusTone> = {
  DRAFT: 'neutral',
  IN_REVIEW: 'info',
  PUBLISHED: 'positive',
  UNPUBLISHED: 'warning',
  DELISTED: 'neutral',
  SUSPENDED: 'critical',
  REJECTED: 'critical',
};

const VISIBILITY_TONES: Record<string, AdminStatusTone> = {
  VISIBLE: 'positive',
  HIDDEN: 'neutral',
  DELISTED: 'warning',
  REGION_RESTRICTED: 'info',
};

export interface ListingStatusBadgeProps {
  /** Raw listing status token from the backend, for example `PUBLISHED`. */
  status: string;
}

/**
 * Listing status chip.
 *
 * Unknown tokens are surfaced verbatim instead of being silently mapped to a
 * wrong label: the backend owns the status enum and may ship a new value before
 * the console declares copy for it.
 */
export function ListingStatusBadge({ status }: ListingStatusBadgeProps) {
  const { t } = useTranslation();
  const token = status || 'UNKNOWN';
  const tone = LISTING_STATUS_TONES[token];
  const label = tone ? t(`adminListings.status.${token}`) : t('adminListings.unknownToken', { token });
  return <AdminStatusBadge label={label} tone={tone ?? 'neutral'} token={token} />;
}

export interface ListingVisibilityBadgeProps {
  /** Raw storefront visibility token; omitted when the backend reports none. */
  visibility?: string;
}

/** Storefront visibility chip with the same unknown-token policy as the status chip. */
export function ListingVisibilityBadge({ visibility }: ListingVisibilityBadgeProps) {
  const { t } = useTranslation();
  const token = visibility || 'UNKNOWN';
  const tone = VISIBILITY_TONES[token];
  const label = tone
    ? t(`adminListings.visibilityStatus.${token}`)
    : t('adminListings.unknownToken', { token });
  return <AdminStatusBadge label={label} tone={tone ?? 'neutral'} token={token} />;
}
