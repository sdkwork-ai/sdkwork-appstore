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

export interface PublisherListingStatusBadgeProps {
  /** Raw listing status token from the backend, for example `PUBLISHED`. */
  status?: string;
}

/**
 * Listing status chip.
 *
 * Unknown tokens are surfaced verbatim instead of being silently mapped to a
 * wrong label: the backend owns the status enum and may ship a new value before
 * the console declares copy for it.
 */
export function PublisherListingStatusBadge({ status }: PublisherListingStatusBadgeProps) {
  const { t } = useTranslation();
  const token = status || 'UNKNOWN';
  const tone = LISTING_STATUS_TONES[token];
  const label = tone
    ? t(`adminPublishers.listingStatus.${token}`)
    : t('adminPublishers.unknownToken', { token });
  return <AdminStatusBadge label={label} tone={tone ?? 'neutral'} token={token} />;
}
