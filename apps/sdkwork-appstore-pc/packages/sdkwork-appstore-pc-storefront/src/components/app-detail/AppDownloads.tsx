import { useTranslation } from 'react-i18next'
import { Apple, Download, Loader2, Monitor, Terminal, type LucideIcon } from 'lucide-react'
import { Button, Tag, useInstall } from '@sdkwork/appstore-pc-commons'
import {
  formatInstallerSize,
  installSelectionOf,
  paidPricing,
  resolveInstallPlan,
  type DesktopOs,
  type InstallVariant,
} from '@sdkwork/appstore-pc-core'
import type { AppItem } from '../../types'
import { architectureLabelKey, resolveListingBuildAction } from '../../lib/installVariant'

/** Platform glyph of a build row. */
const OS_ICON: Record<DesktopOs, LucideIcon> = {
  windows: Monitor,
  macos: Apple,
  linux: Terminal,
}

interface AppDownloadsProps {
  app: AppItem
}

/**
 * Every published build of the listing, with an explicit action per row.
 *
 * The call to action only offers the build this device should install, so the
 * page still needs a place where a person can deliberately take another
 * platform's or another CPU architecture's file — the same way a desktop
 * download page lists its variants. Rows this host can install go through the
 * install flow; the rest start a plain file download and never enter this
 * machine's installed library.
 */
export function AppDownloads({ app }: AppDownloadsProps) {
  const { t } = useTranslation()
  const { host, installApp, downloadBuild, isInstalled, downloadingArtifactId } = useInstall()
  const plan = resolveInstallPlan(app, host)
  if (plan.status === 'no-desktop-build') {
    return null
  }
  const installed = isInstalled(app.id)
  const acquireLabel =
    paidPricing(app.pricingModel) && !installed
      ? t('appDetail.downloads.acquire')
      : t('appDetail.downloads.install')
  const osLabel = (platform: DesktopOs): string => t(`common.distribution.os.${platform}`)
  const archLabel = (variant: InstallVariant): string | null => {
    const key = architectureLabelKey(variant)
    return key === null ? null : t(`common.distribution.architecture.${key}`)
  }
  const buildMeta = (variant: InstallVariant): string =>
    variant.packageFormatLabel
      ? [
          variant.packageFormatLabel,
          formatInstallerSize(variant.fileSizeBytes),
        ].join(' · ')
      : t('appDetail.downloads.pending')
  const compatibilityHint = (variant: InstallVariant): string | null => {
    if (variant.match === 'emulated') {
      return t('appDetail.install.emulatedHint')
    }
    if (variant.match === 'incompatible') {
      return t('appDetail.install.incompatibleHint')
    }
    return null
  }

  return (
    <div className="mt-10 border-t border-store-line-soft pt-8">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-2xl font-bold text-store-ink">{t('appDetail.downloads.title')}</h3>
        <p className="text-xs text-store-ink-faint">{t('appDetail.downloads.subtitle')}</p>
      </div>
      <div className="overflow-hidden rounded-store-card border border-store-line">
        {plan.variants.map((variant, index) => {
          const Icon = OS_ICON[variant.platform]
          const architecture = archLabel(variant)
          const action = resolveListingBuildAction(app, plan, variant, installed)
          const downloading =
            variant.artifactId !== null && downloadingArtifactId === variant.artifactId
          const buildName = `${osLabel(variant.platform)}${architecture === null ? '' : ` ${architecture}`}`
          const hint = compatibilityHint(variant)
          return (
            <div
              key={variant.key}
              className={`flex items-center gap-3 px-4 py-3 ${
                index === 0 ? '' : 'border-t border-store-line-soft'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 text-store-ink-faint" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-semibold text-store-ink">
                    {buildName}
                  </span>
                  {plan.recommended !== null && plan.recommended.key === variant.key && (
                    <Tag tone="brand">{t('appDetail.install.recommended')}</Tag>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-store-ink-faint">
                  {buildMeta(variant)}
                  {hint === null ? '' : ` · ${hint}`}
                </p>
              </div>
              <div className="shrink-0">
                {variant.artifactId === null ? (
                  <span className="text-xs font-medium text-store-ink-faint">
                    {t('appDetail.downloads.pending')}
                  </span>
                ) : downloading ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled
                    icon={<Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  >
                    {t('appDetail.install.downloading')}
                  </Button>
                ) : action === 'download' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<Download className="h-3.5 w-3.5" />}
                    aria-label={`${t('appDetail.downloads.download')} ${buildName}`}
                    onClick={() => downloadBuild(app, variant)}
                  >
                    {t('appDetail.downloads.download')}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<Download className="h-3.5 w-3.5" />}
                    aria-label={`${acquireLabel} ${buildName}`}
                    onClick={() => installApp(app, installSelectionOf(variant))}
                  >
                    {acquireLabel}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
