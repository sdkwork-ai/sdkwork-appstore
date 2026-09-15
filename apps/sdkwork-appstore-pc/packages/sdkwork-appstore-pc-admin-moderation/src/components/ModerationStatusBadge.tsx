import { useTranslation } from 'react-i18next';
import { AdminStatusBadge, type AdminStatusTone } from '@sdkwork/appstore-pc-admin-shell';

const REVIEW_STATUS_TONES: Record<string, AdminStatusTone> = {
  PENDING: 'pending',
  IN_REVIEW: 'info',
  APPROVED: 'positive',
  REJECTED: 'critical',
  CHANGES_REQUESTED: 'warning',
  CANCELLED: 'neutral',
};

const APPEAL_STATUS_TONES: Record<string, AdminStatusTone> = {
  PENDING: 'pending',
  IN_REVIEW: 'info',
  ACCEPTED: 'positive',
  REJECTED: 'critical',
  WITHDRAWN: 'neutral',
};

export interface ModerationReviewStatusBadgeProps {
  /** Raw status token from the backend, for example `IN_REVIEW`. */
  status: string;
}

/**
 * Review status chip.
 *
 * Unknown tokens are surfaced verbatim instead of being silently mapped to a
 * wrong label: the backend owns the status enum and may ship a new value before
 * the console declares copy for it.
 */
export function ModerationReviewStatusBadge({ status }: ModerationReviewStatusBadgeProps) {
  const { t } = useTranslation();
  const token = status || 'UNKNOWN';
  const tone = REVIEW_STATUS_TONES[token];
  const label = tone ? t(`adminModeration.status.${token}`) : t('adminModeration.unknownToken', { token });
  return <AdminStatusBadge label={label} tone={tone ?? 'neutral'} token={token} />;
}

export interface ModerationAppealStatusBadgeProps {
  /** Raw appeal status token from the backend. */
  status: string;
}

/** Appeal status chip with the same unknown-token policy as the review chip. */
export function ModerationAppealStatusBadge({ status }: ModerationAppealStatusBadgeProps) {
  const { t } = useTranslation();
  const token = status || 'UNKNOWN';
  const tone = APPEAL_STATUS_TONES[token];
  const label = tone
    ? t(`adminModeration.appealStatus.${token}`)
    : t('adminModeration.unknownToken', { token });
  return <AdminStatusBadge label={label} tone={tone ?? 'neutral'} token={token} />;
}
