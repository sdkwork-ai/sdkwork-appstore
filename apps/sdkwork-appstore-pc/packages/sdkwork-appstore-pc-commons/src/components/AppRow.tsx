import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import type { AppItem } from '@sdkwork/appstore-pc-core'
import { DynamicIcon } from './DynamicIcon'
import { formatPrice } from '../formatPrice'
import { useInstall } from '../install'

interface AppRowProps {
  app: AppItem
  showRank?: boolean
  hideButton?: boolean
}

/** Compact catalog row with install/open action. */
export function AppRow({ app, showRank, hideButton }: AppRowProps) {
  const { t, i18n } = useTranslation()
  const { installApp, openApp, isInstalled, isDownloading, downloadProgress } = useInstall()

  const installed = isInstalled(app.id)
  const downloading = isDownloading(app.id)
  const progress = downloadProgress(app.id)

  const handleAction = (event: MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
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
        className="flex items-center justify-between p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 dark:bg-[#20222a] dark:hover:bg-[#262a34] border border-gray-200/70 dark:border-gray-800 transition-all"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
          {showRank && app.chartRank && (
            <span className="text-sm font-bold text-gray-400 dark:text-gray-500 w-5 text-center shrink-0">
              {app.chartRank}
            </span>
          )}

          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${app.iconColor}`}>
            <DynamicIcon name={app.icon} className="text-white w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xs text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
              {app.name}
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">{app.category}</p>
          </div>
        </div>

        {!hideButton && (
          <button
            onClick={handleAction}
            className={`text-[11px] font-medium px-3 py-1 rounded-full shrink-0 transition-all ${
              installed
                ? 'bg-blue-600/15 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-semibold hover:bg-blue-600/25'
                : downloading
                  ? 'bg-amber-500/20 text-amber-500 font-bold'
                  : 'text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-[#2c303c] hover:bg-gray-300 dark:hover:bg-[#383d4c]'
            }`}
          >
            {downloading
              ? `${Math.round(progress)}%`
              : installed
                ? t('common.actions.open')
                : app.price === 0
                  ? t('common.labels.free')
                  : formatPrice(app.price, i18n.language)}
          </button>
        )}
      </motion.div>
    </Link>
  )
}
