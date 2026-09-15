import { useTranslation } from 'react-i18next';
import { AdminStatusBadge, type AdminStatusTone } from '@sdkwork/appstore-pc-admin-shell';

const CHANNEL_STATUS_TONES: Record<string, AdminStatusTone> = {
  ACTIVE: 'positive',
  DISABLED: 'neutral',
  DRAFT: 'pending',
};

const CHANNEL_TYPE_TONES: Record<string, AdminStatusTone> = {
  APPLE_APP_STORE: 'info',
  GOOGLE_PLAY: 'info',
  ENTERPRISE: 'neutral',
  EXTERNAL: 'neutral',
};

const MARKET_STATUS_TONES: Record<string, AdminStatusTone> = {
  DRAFT: 'pending',
  PENDING: 'warning',
  SYNCING: 'info',
  PUBLISHED: 'positive',
  REJECTED: 'critical',
  FAILED: 'critical',
  REMOVED: 'neutral',
};

export interface MarketChannelStatusBadgeProps {
  /** Raw channel status token from the backend, for example `ACTIVE`. */
  status: string;
}

/**
 * Channel status chip.
 *
 * Unknown tokens are surfaced verbatim instead of being silently mapped to a
 * wrong label: the backend owns the status enum and may ship a new value before
 * the console declares copy for it.
 */
export function MarketChannelStatusBadge({ status }: MarketChannelStatusBadgeProps) {
  const { t } = useTranslation();
  const token = status || 'UNKNOWN';
  const tone = CHANNEL_STATUS_TONES[token];
  const label = tone ? t(`adminMarket.channelStatus.${token}`) : t('adminMarket.unknownToken', { token });
  return <AdminStatusBadge label={label} tone={tone ?? 'neutral'} token={token} />;
}

export interface MarketChannelTypeBadgeProps {
  /** Raw channel type token from the backend, for example `APPLE_APP_STORE`. */
  channelType: string;
}

/** Channel type chip with the same unknown-token policy as the status chip. */
export function MarketChannelTypeBadge({ channelType }: MarketChannelTypeBadgeProps) {
  const { t } = useTranslation();
  const token = channelType || 'UNKNOWN';
  const tone = CHANNEL_TYPE_TONES[token];
  const label = tone ? t(`adminMarket.channelType.${token}`) : t('adminMarket.unknownToken', { token });
  return <AdminStatusBadge label={label} tone={tone ?? 'neutral'} token={token} />;
}

export interface MarketReleaseStatusBadgeProps {
  /** Raw market status token from the backend, for example `PUBLISHED`. */
  status: string;
}

/** Market release status chip with the same unknown-token policy. */
export function MarketReleaseStatusBadge({ status }: MarketReleaseStatusBadgeProps) {
  const { t } = useTranslation();
  const token = status || 'UNKNOWN';
  const tone = MARKET_STATUS_TONES[token];
  const label = tone ? t(`adminMarket.marketStatus.${token}`) : t('adminMarket.unknownToken', { token });
  return <AdminStatusBadge label={label} tone={tone ?? 'neutral'} token={token} />;
}
