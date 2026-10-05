import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import type { AppItem } from '@sdkwork/appstore-pc-core'
import { openDistributionUrl, paidPricing, primaryDistributionAction } from '@sdkwork/appstore-pc-core'
import { DynamicIcon } from './DynamicIcon'
import { PlatformBadges } from './PlatformBadges'
import { formatPrice } from '../formatPrice'
import { useInstall } from '../install'

interface AppRowProps {
  app: AppItem
  showRank?: boolean
  hideButton?: boolean
}

/** Compact catalog row whose primary action follows the app's distribution. */
export function AppRow({ app, showRank, hideButton }: AppRowProps) {
  const { t, i18n } = useTranslation()
  const { installApp, openApp, requestQr, isInstalled, isDownloading, downloadProgress } = useInstall()

  const installed = isInstalled(app.id)
  const downloading = isDownloading(app.id)
  const progress = downloadProgress(app.id)
  const primary = primaryDistributionAction(app)

  const handleAction = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    // Web surfaces open directly in a new independent window; mobile and
    // mini-program distributions continue through the scan dialog. Desktop
    // (and platform-less) listings keep the install flow.
    if (primary?.kind === 'open') {
      openDistributionUrl(primary.url)
      return
    }
    if (primary?.kind === 'qr') {
      requestQr(app, primary.group)
      return
    }
    if (installed) {
      openApp(app)
    } else {
      installApp(app)
    }
  }

  return (
    <Link to={`/app/${app.id}`} className="group block cursor-pointer">
      <motion.div
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center justify-between p-3 rounded-store-control bg-store-subtle/80 hover:bg-store-subtle/80 dark:bg-store-surface dark:hover:bg-store-surface border border-store-line transition-all "
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
          {showRank && app.chartRank && (
            <span className="text-sm font-bold text-store-ink-faint w-5 text-center shrink-0 ">
              {app.chartRank}
            </span>
          )}

          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${app.iconColor}`}>
            <DynamicIcon name={app.icon} className="text-white w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs text-store-ink truncate group-hover:text-store-brand transition-colors  ">
              {app.name}
            </h3>
            <div className="mt-0.5 flex items-center gap-1.5 min-w-0">
              <p className="text-[11px] text-store-ink-faint truncate ">{app.category}</p>
              <PlatformBadges platforms={app.platforms} max={2} className="shrink-0" />
            </div>
          </div>
        </div>

        {!hideButton && (
          <button
            onClick={handleAction}
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full shrink-0 transition-all ${
              installed
                ? 'bg-store-brand/15 text-store-brand dark:bg-store-brand/20 font-medium hover:bg-store-brand/25 '
                : downloading
                  ? 'bg-store-warning/20 text-store-warning font-medium'
                  : 'text-store-ink-soft bg-store-raised hover:bg-gray-300 dark:hover:bg-store-raised '
            }`}
          >
            {downloading
              ? `${Math.round(progress)}%`
              : primary?.kind === 'open'
                ? t('common.distribution.openShort')
                : installed
                  ? t('common.actions.open')
                  : paidPricing(app.pricingModel)
                    ? t('publisher.pricingPaid')
                    : t('common.labels.free')}
          </button>
        )}
      </motion.div>
    </Link>
  )
}
