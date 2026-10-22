import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Apple,
  Check,
  ChevronDown,
  Download,
  Loader2,
  Monitor,
  Terminal,
  type LucideIcon,
} from 'lucide-react'
import { Tag, cx, useInstall } from '@sdkwork/appstore-pc-commons'
import {
  formatInstallerSize,
  installSelectionOf,
  paidPricing,
  type DesktopOs,
  type InstallPlan,
  type InstallVariant,
  type InstallVariantAction,
} from '@sdkwork/appstore-pc-core'
import type { AppItem } from '../../types'
import { architectureLabelKey, resolveListingBuildAction } from '../../lib/installVariant'
import { formatPrice } from '../../lib/utils'

interface AppInstallButtonProps {
  app: AppItem
  /** Install plan resolved once by the header from the shared host snapshot. */
  plan: InstallPlan
}

/** Platform glyph of a build row. */
const OS_ICON: Record<DesktopOs, LucideIcon> = {
  windows: Monitor,
  macos: Apple,
  linux: Terminal,
}

/** Canonical platform order of the "also for" caption. */
const OS_ORDER: readonly DesktopOs[] = ['windows', 'macos', 'linux']

/**
 * The app detail install call to action.
 *
 * The button reflects the host platform instead of offering one fixed label:
 * a host with a matching build gets a brand "Install for {OS}" capsule, a host
 * whose OS the listing does not ship gets a neutral "Choose platform" capsule
 * that opens the builds menu, and an installed app gets the neutral "Open"
 * state. When a listing ships several builds, a split chevron opens the same
 * menu, so CPU architecture and package format are always one click away
 * instead of being guessed silently.
 */
export function AppInstallButton({ app, plan }: AppInstallButtonProps) {
  const { t, i18n } = useTranslation()
  const { installApp, downloadBuild, downloadingArtifactId, openApp, isInstalled } = useInstall()
  const [menuOpen, setMenuOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const installed = isInstalled(app.id)
  const paid = paidPricing(app.pricingModel)
  const recommended = plan.recommended
  const choosePlatform = plan.status === 'choose-platform'
  const split = !choosePlatform && plan.variants.length > 1

  // Paid listings keep the checkout gate for every build: a foreign-platform
  // file is still a paid download, so the first one has to pass through the
  // install dialog (which owns checkout). Once the listing is in the library,
  // builds this host cannot install are downloaded as plain files.
  const actionOf = (variant: InstallVariant): InstallVariantAction =>
    resolveListingBuildAction(app, plan, variant, installed)
  const primaryAction: 'open' | 'choose' | InstallVariantAction =
    recommended === null
      ? 'choose'
      : installed && actionOf(recommended) === 'install'
        ? 'open'
        : actionOf(recommended)
  const recommendedDownloading =
    recommended !== null &&
    recommended.artifactId !== null &&
    downloadingArtifactId === recommended.artifactId

  // A different listing never inherits the previous listing's open menu.
  useEffect(() => {
    setMenuOpen(false)
  }, [app.id])

  // Outside pointerdown and Escape close the menu; the trigger's own click
  // toggles, so the outside listener must ignore events inside the root.
  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: PointerEvent): void => {
      if (rootRef.current !== null && !rootRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  if (plan.status === 'no-desktop-build') {
    return null
  }

  const osLabel = (platform: DesktopOs): string => t(`common.distribution.os.${platform}`)
  const archLabel = (variant: InstallVariant): string => {
    const key = architectureLabelKey(variant)
    return key ? t(`common.distribution.architecture.${key}`) : t('appDetail.install.archUnknown')
  }
  const captionMeta = (variant: InstallVariant): string =>
    variant.packageFormatLabel
      ? [
          archLabel(variant),
          variant.packageFormatLabel,
          formatInstallerSize(variant.fileSizeBytes),
        ].join(' · ')
      : t('appDetail.install.artifactPending')
  // The menu row title already names the architecture, so the row's second
  // line carries only the package format and size.
  const rowMeta = (variant: InstallVariant): string =>
    variant.packageFormatLabel
      ? [variant.packageFormatLabel, formatInstallerSize(variant.fileSizeBytes)].join(' · ')
      : t('appDetail.install.artifactPending')
  const hostArchLabel =
    plan.host.arch === null
      ? null
      : t(
          `common.distribution.architecture.${
            plan.host.os === 'macos' && plan.host.arch === 'arm64' ? 'appleSilicon' : plan.host.arch
          }`,
        )
  const hostLabel = plan.host.os
    ? [osLabel(plan.host.os), hostArchLabel].filter((part): part is string => part !== null).join(' · ')
    : null
  const otherPlatforms =
    recommended === null
      ? []
      : Array.from(
          new Set(
            [...plan.variants]
              .filter((variant) => variant.platform !== recommended.platform)
              .sort(
                (left, right) => OS_ORDER.indexOf(left.platform) - OS_ORDER.indexOf(right.platform),
              )
              .map((variant) => osLabel(variant.platform)),
          ),
        )
  const targetOsLabel = recommended === null ? null : osLabel(recommended.platform)
  const primaryLabel =
    primaryAction === 'open'
      ? t('appDetail.install.openInstalled')
      : primaryAction === 'choose' || targetOsLabel === null
        ? t('appDetail.install.choosePlatform')
        : paid && primaryAction === 'install'
          ? app.price > 0
            ? formatPrice(app.price, i18n.language)
            : t('appDetail.install.buy')
          : primaryAction === 'download'
            ? t('appDetail.install.downloadForOs', { os: targetOsLabel })
            : t('appDetail.install.forOs', { os: targetOsLabel })

  const handlePrimary = (): void => {
    if (primaryAction === 'open') {
      openApp(app)
      return
    }
    if (primaryAction === 'choose' || recommended === null) {
      setMenuOpen((open) => !open)
      return
    }
    if (primaryAction === 'download') {
      downloadBuild(app, recommended)
      return
    }
    installApp(app, installSelectionOf(recommended))
  }

  const chooseVariant = (variant: InstallVariant): void => {
    setMenuOpen(false)
    if (actionOf(variant) === 'download') {
      downloadBuild(app, variant)
      return
    }
    installApp(app, installSelectionOf(variant))
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="relative inline-flex" ref={rootRef}>
        <div className="inline-flex items-stretch">
          <button
            type="button"
            onClick={handlePrimary}
            disabled={recommendedDownloading}
            aria-haspopup={choosePlatform ? 'menu' : undefined}
            aria-expanded={choosePlatform ? menuOpen : undefined}
            className={cx(
              'inline-flex h-10 items-center gap-1.5 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60',
              split ? 'rounded-l-full pl-5 pr-4' : 'rounded-full px-5 py-2',
              installed
                ? 'bg-store-subtle text-store-ink-soft hover:bg-store-raised'
                : choosePlatform
                  ? 'border border-store-line-strong bg-store-subtle text-store-ink hover:bg-store-raised'
                  : 'bg-store-brand text-store-on-brand hover:bg-store-brand-hover',
            )}
          >
            {recommendedDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : primaryAction === 'open' ? (
              <Check className="h-4 w-4" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {recommendedDownloading ? t('appDetail.install.downloading') : primaryLabel}
            {choosePlatform && (
              <ChevronDown
                className={cx('h-4 w-4 transition-transform', menuOpen && 'rotate-180')}
              />
            )}
          </button>
          {split && (
            <button
              type="button"
              aria-label={t('appDetail.install.moreOptions')}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className={cx(
                'inline-flex h-10 cursor-pointer items-center justify-center rounded-r-full border-l pl-2.5 pr-4 text-sm font-medium transition-colors',
                installed
                  ? 'border-store-line bg-store-subtle text-store-ink-soft hover:bg-store-raised'
                  : 'border-store-on-brand/30 bg-store-brand text-store-on-brand hover:bg-store-brand-hover',
              )}
            >
              <ChevronDown
                className={cx('h-4 w-4 transition-transform', menuOpen && 'rotate-180')}
              />
            </button>
          )}
        </div>

        {menuOpen && (
          <div
            role="menu"
            aria-label={t('appDetail.install.menuTitle')}
            className="absolute left-0 right-auto top-full z-50 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-store-card border border-store-line bg-store-surface p-1.5 shadow-xl md:left-auto md:right-0"
          >
            <div className="px-2.5 pb-1.5 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-store-ink-faint">
                {t('appDetail.install.menuTitle')}
              </p>
              {hostLabel !== null && (
                <p className="mt-0.5 text-xs text-store-ink-soft">
                  {t('appDetail.install.thisDevice')}: {hostLabel}
                </p>
              )}
            </div>
            {plan.variants.map((variant) => {
              const Icon = OS_ICON[variant.platform]
              return (
                <button
                  key={variant.key}
                  type="button"
                  role="menuitem"
                  onClick={() => chooseVariant(variant)}
                  className="flex w-full cursor-pointer items-center gap-2.5 rounded-store-control px-2.5 py-2 text-left text-sm font-medium transition-colors hover:bg-store-subtle"
                >
                  <Icon className="h-4 w-4 shrink-0 text-store-ink-faint" />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="truncate text-xs font-semibold leading-4 text-store-ink">
                      {osLabel(variant.platform)}
                      {variant.architecture !== null ? ` · ${archLabel(variant)}` : ''}
                    </span>
                    <span className="truncate text-[11px] leading-4 text-store-ink-faint">
                      {rowMeta(variant)}
                      {variant.match === 'incompatible' && (
                        <> · {t('appDetail.install.incompatibleHint')}</>
                      )}
                    </span>
                  </span>
                  {variant.artifactId !== null &&
                  downloadingArtifactId === variant.artifactId ? (
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin text-store-ink-faint" />
                  ) : recommended !== null && recommended.key === variant.key ? (
                    <Tag tone="brand">{t('appDetail.install.recommended')}</Tag>
                  ) : actionOf(variant) === 'download' ? (
                    <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-store-ink-faint">
                      <Download className="h-3.5 w-3.5" />
                      {t('appDetail.install.download')}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col items-start gap-0.5">
        {installed ? (
          <p className="text-[11px] text-store-ink-faint">{t('appDetail.install.installedHint')}</p>
        ) : choosePlatform ? (
          <>
            {plan.host.os !== null && (
              <p className="text-[11px] text-store-ink-soft">
                {t('appDetail.install.unavailableFor', { os: osLabel(plan.host.os) })}
              </p>
            )}
            <p className="text-[11px] text-store-ink-faint">
              {t('appDetail.install.chooseHint')}
            </p>
          </>
        ) : recommended !== null ? (
          <>
            <p className="text-[11px] text-store-ink-faint">
              {captionMeta(recommended)}
              {otherPlatforms.length > 0 && (
                <>
                  {' · '}
                  {t('appDetail.install.alsoFor', { platforms: otherPlatforms.join(' / ') })}
                </>
              )}
            </p>
            {recommended.match === 'emulated' ? (
              <p className="text-[11px] text-store-warning">
                {t('appDetail.install.emulatedHint')}
              </p>
            ) : recommended.match === 'incompatible' ? (
              <p className="text-[11px] text-store-warning">
                {t('appDetail.install.incompatibleWarning')}
              </p>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
