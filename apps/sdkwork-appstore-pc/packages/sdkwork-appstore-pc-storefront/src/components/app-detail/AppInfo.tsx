import { useTranslation } from 'react-i18next';
import {
  availableInstallVariants,
  platformGroupsForCodes,
  type DesktopOs,
} from '@sdkwork/appstore-pc-core';
import { AppItem } from '../../types';
import { architectureLabelKey } from '../../lib/installVariant';
import { AppInfoRow } from './AppInfoRow';

interface AppInfoProps {
  app: AppItem;
}

/**
 * Build coverage of the listing, grouped per desktop OS: `Windows x64 / ARM64 ·
 * macOS Apple Silicon · Linux x64`. The row only appears when the release
 * publishes installer artifacts, so a listing without a desktop build never
 * shows an empty compatibility line.
 */
function useBuildCoverage(app: AppItem): string | null {
  const { t } = useTranslation();
  const variants = availableInstallVariants(app);
  if (variants.length === 0) {
    return null;
  }
  const byPlatform = new Map<DesktopOs, string[]>();
  for (const variant of variants) {
    const architectures = byPlatform.get(variant.platform) ?? [];
    const key = architectureLabelKey(variant);
    const label = key ? t(`common.distribution.architecture.${key}`) : null;
    if (label !== null && !architectures.includes(label)) {
      architectures.push(label);
    }
    byPlatform.set(variant.platform, architectures);
  }
  return Array.from(byPlatform, ([platform, architectures]) => {
    const osLabel = t(`common.distribution.os.${platform}`);
    return architectures.length > 0 ? `${osLabel} ${architectures.join(' / ')}` : osLabel;
  }).join(' · ');
}

export function AppInfo({ app }: AppInfoProps) {
  const { t } = useTranslation();
  const buildCoverage = useBuildCoverage(app);

  return (
    <div className="pt-8 border-t border-store-line-soft mt-10 ">
      <h3 className="text-2xl font-bold mb-6 text-store-ink ">{t('appDetail.info.title')}</h3>
      <div className="flex flex-col">
        <AppInfoRow label={t('appDetail.info.provider')} value={app.seller || app.developer} />
        {platformGroupsForCodes(app.platforms).length > 0 && (
          <AppInfoRow
            label={t('common.platformGroups.title')}
            value={platformGroupsForCodes(app.platforms)
              .map((group) => t(`common.platformGroups.${group}`))
              .join(' / ')}
          />
        )}
        {buildCoverage !== null && (
          <AppInfoRow label={t('appDetail.info.compatibility')} value={buildCoverage} />
        )}
        <AppInfoRow label={t('appDetail.info.size')} value={app.size} />
        <AppInfoRow label={t('appDetail.info.category')} value={app.category} isLink />
        <AppInfoRow label={t('appDetail.info.language')} value={app.language || 'English'} />
        <AppInfoRow label={t('appDetail.info.ageRating')} value={app.ageRating} />
      </div>
    </div>
  );
}
