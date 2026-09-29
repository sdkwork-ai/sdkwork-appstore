import { Link } from 'react-router-dom'
import { Flame } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AppItem } from '@sdkwork/appstore-pc-core'
import { DynamicIcon } from './DynamicIcon'
import { useInstall } from '../install'

interface MiniGameCardProps {
  game: AppItem
}

/** Compact mini-game card with install/open action. */
export function MiniGameCard({ game }: MiniGameCardProps) {
  const { t } = useTranslation()
  const { installApp, openApp, isInstalled, isDownloading } = useInstall()
  const installed = isInstalled(game.id)
  const downloading = isDownloading(game.id)

  return (
    <Link
      to={`/app/${game.id}`}
      className="flex-none w-36 group bg-store-subtle/60 dark:bg-store-surface hover:bg-store-raised/80 dark:hover:bg-store-raised border border-store-line p-3 rounded-store-card flex flex-col items-center text-center transition-all cursor-pointer "
    >
      <div className="relative mb-2">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-md ${game.iconColor} overflow-hidden group-hover:scale-105 transition-transform`}>
          <DynamicIcon name={game.icon} className="text-white w-10 h-10" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-store-success text-white text-[9px] font-bold p-1 rounded-full border-2 border-white dark:border-store-line">
          <Flame className="w-2.5 h-2.5" />
        </div>
      </div>

      <h4 className="font-bold text-xs text-store-ink truncate w-full group-hover:text-store-brand transition-colors ">
        {game.name}
      </h4>
      <span className="text-[10px] text-store-ink-faint mt-0.5 mb-2 truncate w-full">
        {game.category}
      </span>

      <button
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          if (installed) openApp(game)
          else installApp(game)
        }}
        className={`w-full py-1 rounded-full text-xs font-medium transition-all ${
          installed
            ? 'bg-store-brand/15 text-store-brand dark:bg-store-brand/20 '
            : downloading
              ? 'bg-store-warning/20 text-store-warning'
              : 'bg-store-raised text-store-ink-soft hover:bg-gray-300 dark:hover:bg-store-raised '
        }`}
      >
        {downloading ? t('common.actions.downloading') : installed ? t('common.actions.open') : t('common.actions.downloadFree')}
      </button>
    </Link>
  )
}
